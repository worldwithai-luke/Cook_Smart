// Local storage utilities for client-side data persistence
// This can be used for storing user preferences, recent searches, etc.

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

// Keys for commonly used storage items
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'chefmate_user_preferences',
  RECENT_SEARCHES: 'chefmate_recent_searches',
  ONBOARDING_COMPLETED: 'chefmate_onboarding_completed',
} as const;
