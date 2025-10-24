import { loadFromLocal, saveToLocal, StorageKeys } from '../utils/storage.js';
import { marked } from 'marked';
import { generateId } from '../utils/helpers.js'; // Import generateId

class AppState {
  constructor() {
    this.user = null;
    this.todos = loadFromLocal(StorageKeys.TODOS, []);
    this.events = loadFromLocal(StorageKeys.EVENTS, []);
    this.transactions = loadFromLocal(StorageKeys.TRANSACTIONS, []);
    this.budget = loadFromLocal(StorageKeys.BUDGET, { 
      weekly: 50000, 
      monthly: 200000,
      limit: 50000
    });
    this.settings = loadFromLocal(StorageKeys.SETTINGS, {
      hustleMode: false,
      sapaMode: false,
      notifications: true
    });
    this.aiMessages = loadFromLocal(StorageKeys.AI_MESSAGES, {
      dailyBrief: null,
      budgetInsight: null,
      timeManagementAdvice: null, // New AI message type
    });
    this.currentView = 'dashboard';
    this.todoFilter = 'all'; // New property for todo filtering
    this.notifications = loadFromLocal(StorageKeys.NOTIFICATIONS, []);
    this.chatSessions = loadFromLocal(StorageKeys.CHAT_SESSIONS, []); // Stores multiple chat sessions
    this.currentChatSessionId = null; // Tracks the currently active chat session
    this.listeners = new Map();
  }

  getRemainingBudget() {
    const totalSpent = this.transactions.reduce((sum, t) => sum + t.amount, 0);
    return this.budget.limit - totalSpent;
  }

  getEventsForDateRange(startDate, endDate) {
    const allExpandedEvents = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    this.events.forEach(event => {
      if (event.recurrence === 'none') {
        const eventDate = new Date(event.date);
        if (eventDate >= start && eventDate <= end) {
          allExpandedEvents.push(event);
        }
      } else {
        let currentRecurrenceDate = new Date(event.date);
        while (currentRecurrenceDate <= end) {
          if (currentRecurrenceDate >= start) {
            allExpandedEvents.push({ ...event, date: currentRecurrenceDate.toISOString().split('T')[0] });
          }

          if (event.recurrence === 'daily') {
            currentRecurrenceDate.setDate(currentRecurrenceDate.getDate() + 1);
          } else if (event.recurrence === 'weekly') {
            currentRecurrenceDate.setDate(currentRecurrenceDate.getDate() + 7);
          } else if (event.recurrence === 'monthly') {
            currentRecurrenceDate.setMonth(currentRecurrenceDate.getMonth() + 1);
          } else {
            break; // Unknown recurrence type
          }
        }
      }
    });
    return allExpandedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  setUser(user) {
    this.user = user;
    this.emit('userChanged', user);
  }

  setView(view) {
    this.currentView = view;
    this.emit('viewChanged', view);
  }

  addTodo(todo) {
    this.todos.push(todo);
    saveToLocal(StorageKeys.TODOS, this.todos);
    this.setAIMessage('dailyBrief', null);
    this.setAIMessage('timeManagementAdvice', null); // Clear time management advice
    this.emit('todosChanged', this.todos);
  }

  updateTodo(id, updates) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      this.todos[index] = { ...this.todos[index], ...updates };
      saveToLocal(StorageKeys.TODOS, this.todos);
      this.setAIMessage('dailyBrief', null);
      this.setAIMessage('timeManagementAdvice', null); // Clear time management advice
      this.emit('todosChanged', this.todos);
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    saveToLocal(StorageKeys.TODOS, this.todos);
    this.setAIMessage('dailyBrief', null);
    this.setAIMessage('timeManagementAdvice', null); // Clear time management advice
    this.emit('todosChanged', this.todos);
  }

  addEvent(event) {
    this.events.push({ ...event, recurrence: event.recurrence || 'none' });
    saveToLocal(StorageKeys.EVENTS, this.events);
    this.setAIMessage('dailyBrief', null);
    this.setAIMessage('timeManagementAdvice', null); // Clear time management advice
    this.emit('eventsChanged', this.events);
  }

  updateEvent(id, updates) {
    const index = this.events.findIndex(e => e.id === id);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updates };
      saveToLocal(StorageKeys.EVENTS, this.events);
      this.setAIMessage('dailyBrief', null);
      this.setAIMessage('timeManagementAdvice', null); // Clear time management advice
      this.emit('eventsChanged', this.events);
    }
  }

  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id);
    saveToLocal(StorageKeys.EVENTS, this.events);
    this.setAIMessage('dailyBrief', null);
    this.setAIMessage('timeManagementAdvice', null); // Clear time management advice
    this.emit('eventsChanged', this.events);
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
    saveToLocal(StorageKeys.TRANSACTIONS, this.transactions);
    this.setAIMessage('dailyBrief', null);
    this.setAIMessage('budgetInsight', null); // Clear budget insight
    this.emit('transactionsChanged', this.transactions);
    this.emit('budgetChanged', this.budget);
  }

  setBudget(budgetData) {
    this.budget = { ...this.budget, ...budgetData };
    saveToLocal(StorageKeys.BUDGET, this.budget);
    this.setAIMessage('budgetInsight', null); // Clear budget insight
    this.emit('budgetChanged', this.budget);
  }

  toggleHustleMode() {
    this.settings.hustleMode = !this.settings.hustleMode;
    saveToLocal(StorageKeys.SETTINGS, this.settings);
    this.emit('settingsChanged', this.settings);
  }

  toggleSapaMode() {
    this.settings.sapaMode = !this.settings.sapaMode;
    saveToLocal(StorageKeys.SETTINGS, this.settings);
    this.emit('settingsChanged', this.settings);
  }


  setAIMessage(type, message) {
    if (this.aiMessages.hasOwnProperty(type)) {
      this.aiMessages[type] = marked.parse(message || ""); // Parse only the message
      saveToLocal(StorageKeys.AI_MESSAGES, this.aiMessages); // Save the updated object
      this.emit('aiMessagesChanged', this.aiMessages); // Emit the updated object
    } else {
      console.warn(`Attempted to set unknown AI message type: ${type}`);
    }
  }

  addNotification(notification) {
    const newNotification = { ...notification, id: generateId(), timestamp: new Date().toISOString(), read: false };
    this.notifications.unshift(newNotification); // Add to the beginning
    saveToLocal(StorageKeys.NOTIFICATIONS, this.notifications);
    this.emit('notificationsChanged', this.notifications);
  }

  markNotificationAsRead(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index].read = true;
      saveToLocal(StorageKeys.NOTIFICATIONS, this.notifications);
      this.emit('notificationsChanged', this.notifications);
    }
  }

  addChatMessage(sessionId, sender, message) {
    const session = this.chatSessions.find(s => s.id === sessionId);
    if (session) {
      const newMessage = { sender, message, timestamp: new Date().toISOString() };
      session.messages.push(newMessage);
      saveToLocal(StorageKeys.CHAT_SESSIONS, this.chatSessions);
      this.emit('chatSessionsChanged', this.chatSessions);
      this.emit('currentChatSessionChanged', session);
    } else {
      console.warn(`Chat session with ID ${sessionId} not found.`);
    }
  }

  addChatSession(title) {
    const newSession = {
      id: generateId(),
      title: title || `Chat ${this.chatSessions.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    this.chatSessions.push(newSession);
    saveToLocal(StorageKeys.CHAT_SESSIONS, this.chatSessions);
    this.setCurrentChatSession(newSession.id);
    this.emit('chatSessionsChanged', this.chatSessions);
    return newSession;
  }

  deleteChatSession(id) {
    this.chatSessions = this.chatSessions.filter(s => s.id !== id);
    saveToLocal(StorageKeys.CHAT_SESSIONS, this.chatSessions);
    if (this.currentChatSessionId === id) {
      this.currentChatSessionId = this.chatSessions.length > 0 ? this.chatSessions[0].id : null;
    }
    this.emit('chatSessionsChanged', this.chatSessions);
    this.emit('currentChatSessionChanged', this.getCurrentChatSession());
  }

  setCurrentChatSession(id) {
    if (this.chatSessions.some(s => s.id === id)) {
      this.currentChatSessionId = id;
      saveToLocal(StorageKeys.CHAT_SESSIONS, this.chatSessions);
      this.emit('currentChatSessionChanged', this.getCurrentChatSession());
    } else {
      console.warn(`Attempted to set non-existent chat session ID: ${id}`);
    }
  }

  getChatSession(id) {
    return this.chatSessions.find(s => s.id === id);
  }

  getCurrentChatSession() {
    return this.chatSessions.find(s => s.id === this.currentChatSessionId);
  }
}

export const appState = new AppState();


