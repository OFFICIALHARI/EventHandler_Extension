// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  // Remove any existing menu items first
  chrome.contextMenus.removeAll(() => {
    // Create the context menu item
    chrome.contextMenus.create({
      id: 'save-to-eventsaver',
      title: 'Save to EventSaver',
      contexts: ['selection']
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-to-eventsaver') {
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      chrome.action.openPopup();
    });
  }
});

function checkDeadlines() {
  chrome.storage.local.get({ events: [] }, (data) => {
    const now = new Date();
    data.events.forEach((event) => {
      const deadlineDate = new Date(event.deadline);
      const timeRemaining = deadlineDate - now;
      const hoursRemaining = timeRemaining / (1000 * 60 * 60);

      if (hoursRemaining <= 24) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon1.jpeg',
          title: 'Upcoming Deadline',
          message: `Event "${event.title}" is due in ${Math.floor(hoursRemaining)} hours.`,
        });
      }
    });
  });
}

// Check deadlines every hour
setInterval(checkDeadlines, 60 * 60 * 1000);