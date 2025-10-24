import { appState } from '../state/appState.js';
import { formatCurrency, getRelativeTime, isToday } from '../utils/helpers.js';
import { generateDailyBrief } from '../services/ai.js';

export function renderDashboard(container) {
  const todayTodos = appState.todos.filter(t => !t.completed && isToday(t.dueDate));
  const highPriorityTodos = appState.todos.filter(t => !t.completed && t.priority === 'high');
  const todayEvents = appState.events.filter(e => isToday(e.date));
  const weekSpending = appState.transactions
    .filter(t => {
      const date = new Date(t.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  container.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gradient">Theora</h1>
          <div class="flex items-center space-x-4">
            <button id="hustleModeBtn" class="btn ${appState.settings.hustleMode ? 'btn-primary' : 'btn-secondary'} text-sm">
              💪 ${appState.settings.hustleMode ? 'Hustle ON' : 'Hustle OFF'}
            </button>
            <button id="logoutBtn" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-white border-b sticky top-0 z-10">
        <div class="container mx-auto px-4">
          <div class="flex space-x-8">
            <button data-view="dashboard" class="nav-item active py-4 px-2 border-b-2 border-primary-600 font-medium text-primary-600">
              Dashboard
            </button>
            <button data-view="todos" class="nav-item py-4 px-2 font-medium text-gray-600 hover:text-gray-900">
              Todos
            </button>
            <button data-view="calendar" class="nav-item py-4 px-2 font-medium text-gray-600 hover:text-gray-900">
              Calendar
            </button>
            <button data-view="budget" class="nav-item py-4 px-2 font-medium text-gray-600 hover:text-gray-900">
              Budget
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-8">
        <!-- AI Daily Brief -->
        <div class="card mb-6 bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
          <div class="flex items-start space-x-4">
            <div class="text-4xl">🤖</div>
            <div class="flex-1">
              <h2 class="text-xl font-semibold mb-2">Today's Game Plan</h2>
              <p id="dailyBrief" class="text-gray-700">Loading your personalized brief...</p>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="card bg-red-50 border-red-200">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-600">Urgent Tasks</h3>
              <span class="text-2xl">🔥</span>
            </div>
            <p class="text-3xl font-bold text-red-600">${highPriorityTodos.length}</p>
            <p class="text-xs text-gray-500 mt-1">High priority</p>
          </div>

          <div class="card bg-blue-50 border-blue-200">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-600">Today's Tasks</h3>
              <span class="text-2xl">📝</span>
            </div>
            <p class="text-3xl font-bold text-blue-600">${todayTodos.length}</p>
            <p class="text-xs text-gray-500 mt-1">Due today</p>
          </div>

          <div class="card bg-purple-50 border-purple-200">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-600">Events Today</h3>
              <span class="text-2xl">📅</span>
            </div>
            <p class="text-3xl font-bold text-purple-600">${todayEvents.length}</p>
            <p class="text-xs text-gray-500 mt-1">Scheduled</p>
          </div>

          <div class="card bg-green-50 border-green-200">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-600">Week Spending</h3>
              <span class="text-2xl">💰</span>
            </div>
            <p class="text-3xl font-bold text-green-600">${formatCurrency(weekSpending)}</p>
            <p class="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Priority Tasks -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">Priority Tasks</h2>
              <button id="viewAllTodos" class="text-primary-600 hover:underline text-sm">View All</button>
            </div>
            <div id="priorityTodosList" class="space-y-3">
              ${highPriorityTodos.length === 0 
                ? '<p class="text-gray-500 text-center py-8">No urgent tasks! You\'re doing great 🎉</p>'
                : highPriorityTodos.slice(0, 3).map(todo => `
                  <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input type="checkbox" class="mt-1 rounded" data-todo-id="${todo.id}">
                    <div class="flex-1">
                      <p class="font-medium">${todo.title}</p>
                      <p class="text-sm text-gray-500">${getRelativeTime(todo.dueDate)}</p>
                    </div>
                    <span class="badge badge-high">HIGH</span>
                  </div>
                `).join('')
              }
            </div>
          </div>

          <!-- Today's Events -->
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">Today's Schedule</h2>
              <button id="viewCalendar" class="text-primary-600 hover:underline text-sm">View Calendar</button>
            </div>
            <div id="todayEventsList" class="space-y-3">
              ${todayEvents.length === 0
                ? '<p class="text-gray-500 text-center py-8">No events scheduled today ✨</p>'
                : todayEvents.map(event => `
                  <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span class="text-2xl">${event.icon || '📌'}</span>
                    <div class="flex-1">
                      <p class="font-medium">${event.title}</p>
                      <p class="text-sm text-gray-500">${event.time || 'All day'}</p>
                    </div>
                  </div>
                `).join('')
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  setupDashboardListeners(container);
  loadDailyBrief(container);
}

function setupDashboardListeners(container) {
  const navItems = container.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      appState.setView(view);
    });
  });

  const hustleModeBtn = container.querySelector('#hustleModeBtn');
  hustleModeBtn?.addEventListener('click', () => {
    appState.toggleHustleMode();
    appState.setView('dashboard');
  });

  const logoutBtn = container.querySelector('#logoutBtn');
  logoutBtn?.addEventListener('click', () => {
    appState.setUser(null);
    appState.setView('auth');
  });

  const viewAllTodos = container.querySelector('#viewAllTodos');
  viewAllTodos?.addEventListener('click', () => {
    appState.setView('todos');
  });

  const viewCalendar = container.querySelector('#viewCalendar');
  viewCalendar?.addEventListener('click', () => {
    appState.setView('calendar');
  });

  const todoCheckboxes = container.querySelectorAll('input[type="checkbox"][data-todo-id]');
  todoCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const todoId = e.target.dataset.todoId;
      appState.updateTodo(todoId, { completed: e.target.checked });
      appState.setView('dashboard');
    });
  });
}

async function loadDailyBrief(container) {
  const briefElement = container.querySelector('#dailyBrief');
  if (!briefElement) return;

  try {
    const todayTodos = appState.todos.filter(t => !t.completed && isToday(t.dueDate));
    const todayEvents = appState.events.filter(e => isToday(e.date));
    const brief = await generateDailyBrief(todayTodos, appState.getRemainingBudget(), todayEvents);
    briefElement.textContent = brief;
  } catch (error) {
    briefElement.textContent = 'Good morning! Ready to crush your goals today? 💪';
  }
}
