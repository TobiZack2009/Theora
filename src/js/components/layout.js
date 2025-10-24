import { appState } from '../state/appState.js';
import { initTheme, toggleTheme } from '../utils/theme.js';

function renderNavItems() {
  const views = ['dashboard', 'todos', 'calendar', 'budget'];
  return views.map(view => `
    <button 
      data-view="${view}" 
      class="nav-item py-4 px-2 font-medium capitalize transition-colors duration-200 border-b-2 
      ${appState.currentView === view 
        ? 'border-primary-blue text-primary-blue'
        : 'border-transparent text-text-secondary hover:text-text-primary'}"
    >
      ${view}
    </button>
  `).join('');
}

export function renderLayout(container, viewRenderer) {
  const appShell = `
    <div class="min-h-screen bg-bg-primary text-text-primary">
      <!-- Header -->
      <header class="bg-bg-secondary/80 backdrop-blur-sm border-b border-border-color sticky top-0 z-20">
        <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
            <img src="generated-icon.png" alt="Theora Logo" class="h-8 w-8">
            <h1 class="text-2xl font-bold text-gradient">Theora</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <button id="theme-toggle" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-primary">
              <svg id="theme-icon-sun" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <svg id="theme-icon-moon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            </button>
            <button id="logoutBtn" class="text-text-secondary hover:text-text-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-bg-secondary border-b border-border-color sticky top-[61px] z-10">
        <div class="container mx-auto px-4">
          <div class="flex space-x-8">
            ${renderNavItems()}
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main id="main-content" class="container mx-auto px-4 py-8">
        <!-- View content will be rendered here -->
      </main>

      <!-- Notifications -->
      <div id="notification-toast" class="notification-toast">
        <p id="notification-message"></p>
      </div>
      <div id="ai-tip-card" class="ai-tip-card">
        <p id="ai-tip-message"></p>
      </div>
    </div>
  `;

  container.innerHTML = appShell;
  
  const mainContent = container.querySelector('#main-content');
  viewRenderer(mainContent);

  // Setup listeners
  container.querySelector('#theme-toggle').addEventListener('click', toggleTheme);
  container.querySelector('#logoutBtn').addEventListener('click', () => {
    appState.setUser(null);
    appState.setView('auth');
  });

  container.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      if (view) appState.setView(view);
    });
  });
  
  initTheme();
}