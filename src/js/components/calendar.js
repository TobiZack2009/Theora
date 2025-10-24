import { appState } from '../state/appState.js';
import { generateId, formatDate, isToday } from '../utils/helpers.js';

let currentDisplayMonth;
let currentDisplayYear;

export function renderCalendar(container, month = new Date().getMonth(), year = new Date().getFullYear()) {
  currentDisplayMonth = month;
  currentDisplayYear = year;

  container.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4 flex items-center justify-between">
          <button id="backBtn" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-gradient">Calendar</h1>
          <button id="addEventBtn" class="btn btn-primary text-sm">+ Add Event</button>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8 max-w-6xl">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Calendar View -->
          <div class="lg:col-span-2 card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold" id="currentMonthYear">${getMonthName(currentDisplayMonth)} ${currentDisplayYear}</h2>
              <div class="flex space-x-2">
                <button id="prevMonth" class="btn btn-secondary text-sm">←</button>
                <button id="nextMonth" class="btn btn-secondary text-sm">→</button>
              </div>
            </div>
            <div class="grid grid-cols-7 gap-2 mb-4">
              ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                `<div class="text-center text-sm font-medium text-gray-600 py-2">${day}</div>`
              ).join('')}
            </div>
            <div id="calendarGrid" class="grid grid-cols-7 gap-2">
              ${renderCalendarDays(currentDisplayMonth, currentDisplayYear)}
            </div>
          </div>

          <!-- Upcoming Events -->
          <div class="card">
            <h2 class="text-xl font-semibold mb-4">Upcoming Events</h2>
            <div id="upcomingEvents" class="space-y-3">
              ${renderUpcomingEvents()}
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Add/Edit Event Modal -->
    <div id="eventModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="card max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold" id="modalTitle">Add New Event</h2>
          <button id="closeModal" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form id="eventForm" class="space-y-4">
          <input type="hidden" id="eventId">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input type="text" id="eventTitle" class="input" placeholder="Team meeting" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="eventDescription" class="input" rows="2" placeholder="Optional details..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" id="eventDate" class="input" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" id="eventTime" class="input">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <div class="grid grid-cols-6 gap-2">
              ${['📅', '📝', '💼', '🎓', '💰', '🎉', '🏃', '🍔', '✈️', '📱', '🎯', '⚡'].map(icon => `
                <button type="button" class="icon-select p-2 text-2xl hover:bg-gray-100 rounded border border-transparent" data-icon="${icon}">${icon}</button>
              `).join('')}
            </div>
            <input type="hidden" id="eventIcon" value="📅">
          </div>
          <div class="flex space-x-3">
            <button type="submit" class="btn btn-primary flex-1">Save Event</button>
            <button type="button" id="cancelEventBtn" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  setupCalendarListeners(container);
}

function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month];
}

function renderCalendarDays(month, year) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  let html = '';
  
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="aspect-square"></div>';
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayEvents = appState.events.filter(e => e.date === dateStr);
    const isTodayDate = today.toDateString() === date.toDateString();
    
    html += `
      <div class="aspect-square p-2 border rounded-lg hover:bg-gray-50 cursor-pointer ${isTodayDate ? 'bg-primary-50 border-primary-300' : 'border-gray-200'}" data-date="${dateStr}">
        <div class="text-sm font-medium ${isTodayDate ? 'text-primary-600' : ''}">${day}</div>
        ${dayEvents.length > 0 ? `<div class="text-xs text-gray-500 mt-1">${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}</div>` : ''}
      </div>
    `;
  }
  
  return html;
}

function renderUpcomingEvents() {
  const today = new Date();
  const upcoming = appState.events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10);

  if (upcoming.length === 0) {
    return '<p class="text-gray-500 text-center py-8">No upcoming events 📅</p>';
  }

  return upcoming.map(event => `
    <div class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div class="flex items-start space-x-3">
        <span class="text-2xl">${event.icon || '📅'}</span>
        <div class="flex-1">
          <p class="font-medium">${event.title}</p>
          <p class="text-sm text-gray-600">${formatDate(event.date)} ${event.time ? `at ${event.time}` : ''}</p>
        </div>
        <button class="delete-event text-red-600 hover:text-red-700" data-event-id="${event.id}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

function setupCalendarListeners(container) {
  const backBtn = container.querySelector('#backBtn');
  backBtn?.addEventListener('click', () => {
    appState.setView('dashboard');
  });

  const addEventBtn = container.querySelector('#addEventBtn');
  const eventModal = container.querySelector('#eventModal');
  const closeModal = container.querySelector('#closeModal');
  const cancelEventBtn = container.querySelector('#cancelEventBtn');
  const eventForm = container.querySelector('#eventForm');

  addEventBtn?.addEventListener('click', () => {
    eventForm.reset();
    container.querySelector('#eventId').value = '';
    container.querySelector('#modalTitle').textContent = 'Add New Event';
    container.querySelector('#eventDate').value = new Date().toISOString().split('T')[0];
    eventModal.classList.remove('hidden');
  });

  closeModal?.addEventListener('click', () => {
    eventModal.classList.add('hidden');
  });

  cancelEventBtn?.addEventListener('click', () => {
    eventModal.classList.add('hidden');
  });

  const iconBtns = container.querySelectorAll('.icon-select');
  iconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      iconBtns.forEach(b => b.classList.remove('border-primary-500', 'bg-primary-50'));
      btn.classList.add('border-primary-500', 'bg-primary-50');
      container.querySelector('#eventIcon').value = btn.dataset.icon;
    });
  });

  eventForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = container.querySelector('#eventId').value;
    const eventData = {
      title: container.querySelector('#eventTitle').value,
      description: container.querySelector('#eventDescription').value,
      date: container.querySelector('#eventDate').value,
      time: container.querySelector('#eventTime').value,
      icon: container.querySelector('#eventIcon').value,
      createdAt: new Date().toISOString()
    };

    if (id) {
      appState.updateEvent(id, eventData);
    } else {
      appState.addEvent({ ...eventData, id: generateId() });
    }

    eventModal.classList.add('hidden');
    appState.setView('calendar');
  });

  const deleteBtns = container.querySelectorAll('.delete-event');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this event?')) {
        appState.deleteEvent(btn.dataset.eventId);
        appState.setView('calendar');
      }
    });
  });

  // New event listeners for month navigation
  const prevMonthBtn = container.querySelector('#prevMonth');
  const nextMonthBtn = container.querySelector('#nextMonth');

  prevMonthBtn?.addEventListener('click', () => {
    currentDisplayMonth--;
    if (currentDisplayMonth < 0) {
      currentDisplayMonth = 11;
      currentDisplayYear--;
    }
    renderCalendar(container, currentDisplayMonth, currentDisplayYear);
  });

  nextMonthBtn?.addEventListener('click', () => {
    currentDisplayMonth++;
    if (currentDisplayMonth > 11) {
      currentDisplayMonth = 0;
      currentDisplayYear++;
    }
    renderCalendar(container, currentDisplayMonth, currentDisplayYear);
  });
}