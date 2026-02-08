import { UserProfile } from '../types';

interface UserSession {
  user: UserProfile;
  loginTime: string;
  lastActive: string;
}

const SESSION_KEY = '8vents_user_session';

/**
 * Save user session on login
 */
export const saveUserSession = (user: UserProfile): void => {
  const session: UserSession = {
    user,
    loginTime: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    console.log('User session saved:', user.name);
  } catch (error) {
    console.error('Error saving user session:', error);
  }
};

/**
 * Get current user session
 */
export const getUserSession = (): UserSession | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error retrieving user session:', error);
  }
  return null;
};

/**
 * Get current logged-in user
 */
export const getCurrentUser = (): UserProfile | null => {
  const session = getUserSession();
  return session?.user || null;
};

/**
 * Update last active time
 */
export const updateLastActive = (): void => {
  const session = getUserSession();
  if (session) {
    session.lastActive = new Date().toISOString();
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  }
};

/**
 * Export session as JSON
 */
export const exportSessionAsJSON = (): string => {
  const session = getUserSession();
  if (!session) {
    return JSON.stringify({ message: 'No active session' }, null, 2);
  }
  return JSON.stringify(session, null, 2);
};

/**
 * Download session as JSON file
 */
export const downloadSessionAsJSON = (): void => {
  const jsonData = exportSessionAsJSON();
  const element = document.createElement('a');
  const file = new Blob([jsonData], { type: 'application/json' });
  element.href = URL.createObjectURL(file);
  const user = getCurrentUser();
  element.download = `${user?.name || 'user'}_session_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Clear user session on logout
 */
export const clearUserSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
    console.log('User session cleared');
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};

export default {
  saveUserSession,
  getUserSession,
  getCurrentUser,
  updateLastActive,
  exportSessionAsJSON,
  downloadSessionAsJSON,
  clearUserSession,
};
