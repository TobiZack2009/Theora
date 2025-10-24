import { renderApp } from '../components/app.js';
import { appState } from '../state/appState.js';
import { initAIClients } from '../services/ai.js';

export function initializeApp() {
  const appContainer = document.getElementById('app');
  
  if (!appContainer) {
    console.error('App container not found');
    return;
  }

  // Initialize AI clients
  initAIClients();

  const existingUser = appState.user;
  if (!existingUser) {
    appState.setView('auth');
  } else {
    appState.setView('dashboard');
  }
  
  renderApp(appContainer);

  console.log('Theora MVP initialized successfully! 🚀');
}
