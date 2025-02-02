document.addEventListener('DOMContentLoaded', () => {
  renderEvents();
});

document.getElementById('search-event').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  chrome.storage.local.get({ events: [] }, (data) => {
    const filteredEvents = data.events.filter(event =>
      event.title.toLowerCase().includes(searchTerm)
    );
    renderEvents(filteredEvents);
  });
});

function renderEvents(events) {
  const eventList = document.getElementById('event-list');
  if (!eventList) {
    console.error('Event list element not found');
    return;
  }
  eventList.innerHTML = '';

  chrome.storage.local.get({ events: [] }, (data) => {
    if (chrome.runtime.lastError) {
      console.error('Error fetching events:', chrome.runtime.lastError);
      return;
    }

    const eventsToRender = events || data.events;
    if (!eventsToRender.length) {
      eventList.innerHTML = '<div class="no-events">No events found</div>';
      return;
    }

    eventsToRender.forEach((event, index) => {
      try {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';

        const deadlineDate = new Date(event.deadline);
        if (isNaN(deadlineDate.getTime())) {
          console.error('Invalid date for event:', event);
          return;
        }

        const timeRemaining = deadlineDate - new Date();
        const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

        eventCard.innerHTML = `
          <div class="event-info">
            <div class="event-title">${escapeHtml(event.title)}</div>
            <div class="event-deadline">Deadline: ${event.deadline} (${daysRemaining} days remaining)</div>
          </div>
          <div class="event-actions">
            <img src="images/${event.favorite ? 'star-filled.png' : 'star-empty.png'}" 
                 alt="${event.favorite ? 'Remove from favorites' : 'Add to favorites'}" 
                 class="favorite-icon" 
                 onclick="toggleFavorite(${index})">
            <button class="delete-btn" onclick="deleteEvent(${index})">Delete</button>
          </div>
        `;

        eventList.appendChild(eventCard);
      } catch (error) {
        console.error('Error rendering event:', error);
      }
    });
  });
}

function toggleFavorite(index) {
  chrome.storage.local.get({ events: [] }, (data) => {
    const events = data.events;
    events[index].favorite = !events[index].favorite;
    chrome.storage.local.set({ events }, () => {
      renderEvents();
    });
  });
}

function deleteEvent(index) {
  if (confirm('Are you sure you want to delete this event?')) {
    chrome.storage.local.get({ events: [] }, (data) => {
      const events = data.events;
      events.splice(index, 1);
      
      chrome.storage.local.set({ events }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error deleting event:', chrome.runtime.lastError);
          alert('Error deleting event. Please try again.');
        } else {
          renderEvents();
        }
      });
    });
  }
}

function exportEvents() {
  chrome.storage.local.get({ events: [] }, (data) => {
    const events = data.events;
    const exportData = JSON.stringify(events, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Add this helper function to prevent XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Make deleteEvent function globally accessible
window.deleteEvent = function(index) {
  if (confirm('Are you sure you want to delete this event?')) {
    chrome.storage.local.get({ events: [] }, (data) => {
      const events = data.events;
      events.splice(index, 1);  // Remove the event at the specified index
      
      chrome.storage.local.set({ events }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error deleting event:', chrome.runtime.lastError);
          alert('Error deleting event. Please try again.');
        } else {
          // Refresh the display after successful deletion
          renderEvents();
        }
      });
    });
  }
};

// Make toggleFavorite function globally accessible
window.toggleFavorite = function(index) {
  chrome.storage.local.get({ events: [] }, (data) => {
    const events = data.events;
    events[index].favorite = !events[index].favorite;
    
    chrome.storage.local.set({ events }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error updating favorite:', chrome.runtime.lastError);
      } else {
        renderEvents();
      }
    });
  });
};

// Make exportEvents function globally accessible
window.exportEvents = function() {
  chrome.storage.local.get({ events: [] }, (data) => {
    const events = data.events;
    const exportData = JSON.stringify(events, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
};