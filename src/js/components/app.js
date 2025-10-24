import { appState } from '../state/appState.js';
import { onAuthStateChanged, auth } from '../services/firebase.js';
import { renderAuthScreen } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { renderTodos } from './todos.js';
import { renderCalendar } from './calendar.js';
import { renderBudget } from './budget.js';

export function renderApp(container) {
  onAuthStateChanged(auth, (user) => {
    if (user && !appState.user) {
      appState.setUser(user);
    }
  });

  appState.subscribe('userChanged', (user) => {
    if (!user) {
      appState.setView('auth');
    } else if (appState.currentView === 'auth') {
      appState.setView('dashboard');
    } else {
      renderCurrentView(container);
    }
  });

  appState.subscribe('viewChanged', () => {
    renderCurrentView(container);
  });

  appState.subscribe('todosChanged', () => {
    if (appState.currentView === 'todos' || appState.currentView === 'dashboard') {
      renderCurrentView(container);
    }
  });

  appState.subscribe('eventsChanged', () => {
    if (appState.currentView === 'calendar' || appState.currentView === 'dashboard') {
      renderCurrentView(container);
    }
  });

  appState.subscribe('transactionsChanged', () => {
    if (appState.currentView === 'budget' || appState.currentView === 'dashboard') {
      renderCurrentView(container);
    }
  });

  appState.subscribe('budgetChanged', () => {
    if (appState.currentView === 'budget' || appState.currentView === 'dashboard') {
      renderCurrentView(container);
    }
  });

  renderCurrentView(container);
}

function renderCurrentView(container) {
  if (!appState.user && appState.currentView !== 'auth') {
    appState.setView('auth');
    return;
  }

  container.classList.add('fade-in');

  switch (appState.currentView) {
    case 'auth':
      renderAuthScreen(container);
      break;
    case 'dashboard':
      renderDashboard(container);
      break;
    case 'todos':
      renderTodos(container);
      break;
    case 'calendar':
      renderCalendar(container);
      break;
    case 'budget':
      renderBudget(container);
      break;
    default:
      renderDashboard(container);
  }
}
