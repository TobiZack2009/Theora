import { appState } from '../state/appState.js';
import { generateAIResponse } from '../services/ai.js';
import { generateId } from '../utils/helpers.js';
import { getTheme } from '../utils/theme.js';

export function renderAIChat(container) {
  container.innerHTML = `
    <div class="ai-chat-layout flex h-[calc(100vh-180px)]">
      <!-- Chat Sessions Sidebar -->
      <div class="chat-sidebar w-64 bg-bg-secondary border-r border-border-color p-4 overflow-y-auto">
        <button id="new-chat-btn" class="w-full bg-primary-blue text-white py-2 rounded-lg mb-4 hover:bg-primary-blue-dark transition-colors duration-200">
          + New Chat
        </button>
        <div id="chat-sessions-list">
          <!-- Chat sessions will be rendered here -->
        </div>
      </div>

      <!-- Main Chat Window -->
      <div class="main-chat-window flex-1 flex flex-col bg-bg-primary rounded-lg shadow-md">
        <div class="chat-header bg-bg-secondary border-b border-border-color p-4 flex items-center justify-between rounded-t-lg">
          <h2 id="current-chat-title" class="text-xl font-bold"></h2>
          <button id="delete-chat-btn" class="text-error hover:text-red-700 transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
        <div id="chat-messages" class="flex-1 overflow-y-auto p-4">
          <!-- Chat messages will be appended here -->
        </div>
        <div id="chat-loading-indicator" class="text-center p-2 text-text-secondary hidden">
          <div class="dot-pulse"></div>
        </div>
        <div class="chat-input flex p-4 border-t border-border-color bg-bg-secondary rounded-b-lg">
          <input type="text" id="chat-input-field" class="flex-1 p-3 border border-border-color rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-blue bg-bg-primary text-text-primary" placeholder="Ask Theora anything...">
          <button id="send-chat-btn" class="bg-primary-blue text-white px-6 py-3 rounded-r-lg hover:bg-primary-blue-dark transition-colors duration-200">
            Send
          </button>
        </div>
      </div>
    </div>
  `;

  const chatSessionsList = container.querySelector('#chat-sessions-list');
  const newChatBtn = container.querySelector('#new-chat-btn');
  const currentChatTitle = container.querySelector('#current-chat-title');
  const deleteChatBtn = container.querySelector('#delete-chat-btn');
  const chatMessages = container.querySelector('#chat-messages');
  const chatInputField = container.querySelector('#chat-input-field');
  const sendChatBtn = container.querySelector('#send-chat-btn');
  const chatLoadingIndicator = container.querySelector('#chat-loading-indicator');

  // --- Helper Functions ---
  function renderChatSessions() {
    chatSessionsList.innerHTML = appState.chatSessions.map(session => `
      <div class="chat-session-item p-3 mb-2 rounded-lg cursor-pointer transition-colors duration-200
        ${session.id === appState.currentChatSessionId ? 'bg-primary-blue text-white' : 'hover:bg-bg-primary text-text-primary'}"
        data-session-id="${session.id}">
        ${session.title}
      </div>
    `).join('');

    // Add event listeners for session switching
    chatSessionsList.querySelectorAll('.chat-session-item').forEach(item => {
      item.addEventListener('click', (e) => {
        appState.setCurrentChatSession(e.currentTarget.dataset.sessionId);
      });
    });
  }

  function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    const theme = getTheme(); // Get current theme

    let messageClass = 'mb-2 p-2 rounded-lg max-w-[70%]';
    let textClass = '';

    if (sender === 'user') {
      messageClass += ' ml-auto bg-primary-blue'; // Align user messages to the right, primary blue background
      textClass = 'text-white'; // White text for user messages
    } else { // AI messages
      messageClass += ' mr-auto'; // Align AI messages to the left
      textClass = ' text-text-primary'; // Dynamically changing background and text color
    }

    messageElement.className = messageClass;
    messageElement.innerHTML = `<span class="${textClass}">${message}</span>`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
  }

  function renderCurrentChatMessages() {
    chatMessages.innerHTML = ''; // Clear existing messages
    const currentSession = appState.getCurrentChatSession();
    if (currentSession) {
      currentChatTitle.textContent = currentSession.title;
      deleteChatBtn.classList.remove('hidden');
      currentSession.messages.forEach(msg => appendMessage(msg.sender, msg.message));
    } else {
      currentChatTitle.textContent = 'No Chat Selected';
      deleteChatBtn.classList.add('hidden');
    }
  }

  function showLoadingIndicator() {
    chatLoadingIndicator.classList.remove('hidden');
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to show indicator
  }

  function hideLoadingIndicator() {
    chatLoadingIndicator.classList.add('hidden');
  }

  // --- Event Listeners & Initial Render ---

  // Initial check for chat sessions
  if (appState.chatSessions.length === 0) {
    const newSession = appState.addChatSession('New Chat');
    appState.setCurrentChatSession(newSession.id);
  } else if (!appState.currentChatSessionId) {
    appState.setCurrentChatSession(appState.chatSessions[0].id);
  }

  renderChatSessions();
  renderCurrentChatMessages();

  newChatBtn.addEventListener('click', () => {
    const newSession = appState.addChatSession('New Chat');
    appState.setCurrentChatSession(newSession.id);
  });

  deleteChatBtn.addEventListener('click', () => {
    if (appState.currentChatSessionId) {
      appState.deleteChatSession(appState.currentChatSessionId);
    }
  });

  sendChatBtn.addEventListener('click', async () => {
    const userMessage = chatInputField.value.trim();
    const currentSession = appState.getCurrentChatSession();

    if (userMessage && currentSession) {
      appendMessage('user', userMessage);
      appState.addChatMessage(currentSession.id, 'user', userMessage);
      chatInputField.value = '';
      showLoadingIndicator();

      try {
        const context = {
          todos: appState.todos,
          events: appState.events,
          budget: appState.budget,
          transactions: appState.transactions,
          chatHistory: currentSession.messages.map(msg => `${msg.sender}: ${msg.message}`).join('\n'),
        };

        const aiPrompt = `As Theora, a supportive AI assistant, respond to the user's message. You have access to their data. Provide contextual advice based on their todos, events, budget, and transactions. Be encouraging and helpful. \n\nUser Data: ${JSON.stringify(context, null, 2)}\n\nUser: ${userMessage}\nTheora:`;

        const aiResponse = await generateAIResponse(aiPrompt, { maxTokens: 200 });
        appendMessage('ai', aiResponse);
        appState.addChatMessage(currentSession.id, 'ai', aiResponse);
      } catch (error) {
        console.error('Error generating AI chat response:', error);
        appendMessage('ai', 'Sorry, I\'m having trouble connecting right now. Please try again later.');
        appState.addChatMessage(currentSession.id, 'ai', 'Sorry, I\'m having trouble connecting right now. Please try again later.');
      } finally {
        hideLoadingIndicator();
      }
    }
  });

  chatInputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatBtn.click();
    }
  });

  // Subscribe to state changes to re-render UI
  appState.subscribe('chatSessionsChanged', renderChatSessions);
  appState.subscribe('currentChatSessionChanged', renderCurrentChatMessages);
}