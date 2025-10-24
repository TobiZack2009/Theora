import { loadFromLocal, saveToLocal, StorageKeys } from '../utils/storage.js';

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
      todoPrioritization: null,
    });
    this.currentView = 'dashboard';
    this.listeners = new Map();
  }

  getRemainingBudget() {
    const totalSpent = this.transactions.reduce((sum, t) => sum + t.amount, 0);
    return this.budget.limit - totalSpent;
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
    this.emit('todosChanged', this.todos);
  }

  updateTodo(id, updates) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      this.todos[index] = { ...this.todos[index], ...updates };
      saveToLocal(StorageKeys.TODOS, this.todos);
      this.setAIMessage('dailyBrief', null);
      this.emit('todosChanged', this.todos);
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    saveToLocal(StorageKeys.TODOS, this.todos);
    this.setAIMessage('dailyBrief', null);
    this.emit('todosChanged', this.todos);
  }

  addEvent(event) {
    this.events.push(event);
    saveToLocal(StorageKeys.EVENTS, this.events);
    this.setAIMessage('dailyBrief', null);
    this.emit('eventsChanged', this.events);
  }

  updateEvent(id, updates) {
    const index = this.events.findIndex(e => e.id === id);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updates };
      saveToLocal(StorageKeys.EVENTS, this.events);
      this.setAIMessage('dailyBrief', null);
      this.emit('eventsChanged', this.events);
    }
  }

  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id);
    saveToLocal(StorageKeys.EVENTS, this.events);
    this.setAIMessage('dailyBrief', null);
    this.emit('eventsChanged', this.events);
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
    saveToLocal(StorageKeys.TRANSACTIONS, this.transactions);
    this.setAIMessage('dailyBrief', null);
    this.emit('transactionsChanged', this.transactions);
    this.emit('budgetChanged', this.budget);
  }

  setBudget(budgetData) {
    this.budget = { ...this.budget, ...budgetData };
    saveToLocal(StorageKeys.BUDGET, this.budget);
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
      this.aiMessages[type] = message;
      saveToLocal(StorageKeys.AI_MESSAGES, this.aiMessages);
      this.emit('aiMessagesChanged', this.aiMessages);
    } else {
      console.warn(`Attempted to set unknown AI message type: ${type}`);
    }
  }
}

export const appState = new AppState();
