document.addEventListener('DOMContentLoaded', () => {
  // Get the selected text from storage and populate the title field
  chrome.storage.local.get(['selectedText'], (result) => {
    if (result.selectedText) {
      document.getElementById('event-title').value = result.selectedText;
      // Clear the storage after using it
      chrome.storage.local.remove('selectedText');
    }
  });
});

document.getElementById('save-event').addEventListener('click', () => {
  const title = document.getElementById('event-title').value.trim();
  const deadline = document.getElementById('event-deadline').value;
  const favorite = document.getElementById('event-favorite').checked;

  if (!title) {
    alert('Please enter an event title');
    return;
  }
  if (!deadline) {
    alert('Please select a deadline');
    return;
  }

  chrome.storage.local.get({ events: [] }, (data) => {
    const events = data.events;
    events.push({ title, deadline, favorite });
    chrome.storage.local.set({ events }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving event:', chrome.runtime.lastError);
        alert('Error saving event. Please try again.');
      } else {
        window.close();
      }
    });
  });
});

document.getElementById('cancel-event').addEventListener('click', () => {
  window.close();
});

document.getElementById('open-dashboard').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'dashboard.html' });
});