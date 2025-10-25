export const StorageKeys = {
  USER_PROFILE: 'theora_user_profile',
  TODOS: 'theora_todos',
  EVENTS: 'theora_events',
  TRANSACTIONS: 'theora_transactions',
  BUDGET: 'theora_budget',
  SETTINGS: 'theora_settings',
  AI_MESSAGES: 'theora_ai_messages',
  NOTIFICATIONS: 'theora_notifications',
  CHAT_SESSIONS: 'theora_chat_sessions',
  AI_PERSONALITY: 'theora_ai_personality',
  USER_NAME: 'theora_user_name',
  LAST_CHAT_SESSION_ID: 'theora_last_chat_session_id', // New key
};

export function saveToLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

export function loadFromLocal(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromLocal(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

export function clearAllLocal() {
  try {
    Object.values(StorageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}
