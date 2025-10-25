import { db } from '../services/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const StorageKeys = {
  USER: 'theora_user',
  USER_PROFILE: 'theora_user_profile', // This might be redundant with 'userinfo'
  TODOS: 'theora_todos',
  EVENTS: 'theora_events',
  TRANSACTIONS: 'theora_transactions',
  BUDGET: 'theora_budget',
  SETTINGS: 'theora_settings',
  AI_MESSAGES: 'aiMessages',
  CHAT_SESSIONS: 'chatSessions',
  LAST_CHAT_SESSION_ID: 'lastChatSessionId',
  AI_PROVIDER: 'aiProvider',
  AI_RESPONSE_STYLE: 'aiResponseStyle',
  USER_INFO: 'theora_user_info', // New key for user info in localStorage
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

// New storage object for Firestore interaction, especially for userinfo
export const storage = {
  async get(collectionName, docId) {
    // First, try to load from localStorage for offline access
    const localData = loadFromLocal(`${collectionName}_${docId}`);
    if (localData) {
      return localData;
    }

    // If not in localStorage, try to fetch from Firestore
    if (db) {
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          saveToLocal(`${collectionName}_${docId}`, data); // Save to localStorage for future offline access
          return data;
        } else {
          console.log(`No such document for ${collectionName}/${docId} in Firestore!`);
          return null;
        }
      } catch (error) {
        console.error(`Error getting document ${collectionName}/${docId} from Firestore:`, error);
        return null;
      }
    }
    return null; // No local data, no Firestore, return null
  },

  async set(collectionName, docId, data) {
    // Always save to localStorage first
    saveToLocal(`${collectionName}_${docId}`, data);

    // Then, try to save to Firestore if online
    if (db) {
      try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data, { merge: true }); // Use merge to avoid overwriting other fields
        return true;
      } catch (error) {
        console.error(`Error setting document ${collectionName}/${docId} in Firestore:`, error);
        return false;
      }
    }
    return false; // Not saved to Firestore
  },

  // Add a delete method for completeness if needed
  // async delete(collectionName, docId) {
  //   removeFromLocal(`${collectionName}_${docId}`);
  //   if (db) {
  //     try {
  //       const docRef = doc(db, collectionName, docId);
  //       await deleteDoc(docRef);
  //       return true;
  //     } catch (error) {
  //       console.error(`Error deleting document ${collectionName}/${docId} from Firestore:`, error);
  //       return false;
  //     }
  //   }
  //   return false;
  // }
};