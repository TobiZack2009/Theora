import { appState } from '../state/appState.js';
import { onAuthStateChanged, auth } from '../services/firebase.js';
import { renderAuthScreen } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { renderTodos } from './todos.js';
import { renderCalendar } from './calendar.js';
import { renderBudget } from './budget.js';
import { renderLayout } from './layout.js';

export function renderApp(container) {
  onAuthStateChanged(auth, (user) => {
    if (user && !appState.user) {
      appState.setUser(user);
    }
  });

  const render = () => renderCurrentView(container);

  appState.subscribe('userChanged', (user) => {
    if (!user) {
      appState.setView('auth');
    } else if (appState.currentView === 'auth') {
      appState.setView('dashboard');
    } else {
      render();
    }
  });

  appState.subscribe('viewChanged', render);
  appState.subscribe('todosChanged', render);
  appState.subscribe('eventsChanged', render);
  appState.subscribe('transactionsChanged', render);
  appState.subscribe('budgetChanged', render);

  renderCurrentView(container);
}

function renderCurrentView(container) {
  if (!appState.user && appState.currentView !== 'auth') {
    appState.setView('auth');
    return;
  }

  const viewRenderers = {
    auth: renderAuthScreen,
    dashboard: renderDashboard,
    todos: renderTodos,
    calendar: renderCalendar,
    budget: renderBudget,
  };

  const renderer = viewRenderers[appState.currentView] || renderDashboard;

  if (appState.currentView === 'auth') {
    renderer(container);
  } else {
    renderLayout(container, renderer);
  }
}
