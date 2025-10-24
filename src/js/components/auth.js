import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '../services/firebase.js';
import { appState } from '../state/appState.js';

export function renderAuthScreen(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div class="card max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gradient mb-2">Theora</h1>
          <p class="text-gray-600">Your Productivity & Financial Copilot</p>
        </div>

        <div class="mb-6">
          <div class="flex border-b border-gray-200">
            <button id="loginTab" class="flex-1 py-3 font-semibold text-primary-600 border-b-2 border-primary-600">
              Login
            </button>
            <button id="signupTab" class="flex-1 py-3 font-semibold text-gray-500">
              Sign Up
            </button>
          </div>
        </div>

        <div id="authForm">
          <form id="loginForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="loginEmail" class="input" placeholder="your@email.com" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" id="loginPassword" class="input" placeholder="••••••••" required>
            </div>
            <div id="authError" class="hidden text-red-600 text-sm"></div>
            <button type="submit" class="btn btn-primary w-full">Login</button>
          </form>

          <form id="signupForm" class="space-y-4 hidden">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" id="signupName" class="input" placeholder="Chioma Okafor" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="signupEmail" class="input" placeholder="your@email.com" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" id="signupPassword" class="input" placeholder="••••••••" required>
            </div>
            <div id="signupError" class="hidden text-red-600 text-sm"></div>
            <button type="submit" class="btn btn-primary w-full">Create Account</button>
          </form>
        </div>

        <div class="mt-6 text-center">
          <button id="continueOffline" class="text-primary-600 hover:underline text-sm">
            Continue without account (offline mode)
          </button>
        </div>
      </div>
    </div>
  `;

  const loginTab = container.querySelector('#loginTab');
  const signupTab = container.querySelector('#signupTab');
  const loginForm = container.querySelector('#loginForm');
  const signupForm = container.querySelector('#signupForm');
  const continueOfflineBtn = container.querySelector('#continueOffline');

  loginTab.addEventListener('click', () => {
    loginTab.classList.add('text-primary-600', 'border-b-2', 'border-primary-600');
    loginTab.classList.remove('text-gray-500');
    signupTab.classList.remove('text-primary-600', 'border-b-2', 'border-primary-600');
    signupTab.classList.add('text-gray-500');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('text-primary-600', 'border-b-2', 'border-primary-600');
    signupTab.classList.remove('text-gray-500');
    loginTab.classList.remove('text-primary-600', 'border-b-2', 'border-primary-600');
    loginTab.classList.add('text-gray-500');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#loginEmail').value;
    const password = container.querySelector('#loginPassword').value;
    const errorDiv = container.querySelector('#authError');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      appState.setUser(userCredential.user);
      appState.setView('dashboard');
    } catch (error) {
      errorDiv.innerHTML = 'Invalid email or password. Please try again.';
      errorDiv.classList.remove('hidden');
    }
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = container.querySelector('#signupName').value;
    const email = container.querySelector('#signupEmail').value;
    const password = container.querySelector('#signupPassword').value;
    const errorDiv = container.querySelector('#signupError');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      appState.setUser({ ...userCredential.user, displayName: name });
      appState.setView('dashboard');
    } catch (error) {
      errorDiv.innerHTML = error.message || 'Failed to create account. Please try again.';
      errorDiv.classList.remove('hidden');
    }
  });

  continueOfflineBtn.addEventListener('click', () => {
    appState.setUser({ uid: 'offline', email: 'offline@theora.app', offline: true });
    appState.setView('dashboard');
  });
}
