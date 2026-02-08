import { UserProfile, Event, Donation, BlogPost } from '../types';
import { MOCK_USERS, MOCK_EVENTS, MOCK_BLOGS } from '../constants';

// Default data structure
interface AppData {
  users: UserProfile[];
  events: Event[];
  donations: Donation[];
  blogs: BlogPost[];
  lastUpdated: string;
}

const STORAGE_KEY = '8vents_app_data';
const INIT_KEY = '8vents_initialized';
const DATA_FILE_URL = '/data.json';

// Initialize default data
const defaultData: AppData = {
  users: MOCK_USERS,
  events: MOCK_EVENTS,
  donations: [],
  blogs: MOCK_BLOGS,
  lastUpdated: new Date().toISOString(),
};

/**
 * Initialize app data from data.json on first load
 */
export const initializeAppData = async (): Promise<void> => {
  try {
    const isInitialized = localStorage.getItem(INIT_KEY);
    if (!isInitialized) {
      const response = await fetch(DATA_FILE_URL);
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(INIT_KEY, 'true');
        console.log('App data initialized from data.json');
      }
    }
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
};

/**
 * Load data from the data.json file
 */
export const loadDataFromFile = async (): Promise<AppData> => {
  try {
    const response = await fetch(DATA_FILE_URL);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error loading data from file:', error);
  }
  return defaultData;
};

/**
 * Load all data from localStorage or return default data
 */
export const loadAllData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  return defaultData;
};

/**
 * Save all data to localStorage
 */
export const saveAllData = (data: AppData): void => {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

/**
 * Add a new donation
 */
export const addDonation = (donation: Donation): AppData => {
  const data = loadAllData();
  data.donations.push(donation);
  saveAllData(data);
  return data;
};

/**
 * Get all donations
 */
export const getDonations = (): Donation[] => {
  const data = loadAllData();
  return data.donations;
};

/**
 * Get donations by user ID
 */
export const getUserDonations = (userId: string): Donation[] => {
  const data = loadAllData();
  return data.donations.filter(d => d.userId === userId);
};

/**
 * Add a new volunteer
 */
export const addVolunteer = (user: UserProfile): AppData => {
  const data = loadAllData();
  data.users.push(user);
  saveAllData(data);
  return data;
};

/**
 * Get all volunteers
 */
export const getVolunteers = (): UserProfile[] => {
  const data = loadAllData();
  return data.users;
};

/**
 * Add a new event
 */
export const addEvent = (event: Event): AppData => {
  const data = loadAllData();
  data.events.push(event);
  saveAllData(data);
  return data;
};

/**
 * Get all events
 */
export const getEvents = (): Event[] => {
  const data = loadAllData();
  return data.events;
};

/**
 * Get a single event by ID
 */
export const getEventById = (eventId: string): Event | undefined => {
  const data = loadAllData();
  return data.events.find(e => e.id === eventId);
};

/**
 * Add a user to an event's volunteers list
 */
export const addUserToEvent = (eventId: string, userId: string): Event | null => {
  const data = loadAllData();
  const event = data.events.find(e => e.id === eventId);
  
  if (!event) return null;
  
  // Only add if not already in the list
  if (!event.volunteersJoined.includes(userId)) {
    event.volunteersJoined.push(userId);
    saveAllData(data);
  }
  
  return event;
};

/**
 * Remove a user from an event's volunteers list
 */
export const removeUserFromEvent = (eventId: string, userId: string): Event | null => {
  const data = loadAllData();
  const event = data.events.find(e => e.id === eventId);
  
  if (!event) return null;
  
  event.volunteersJoined = event.volunteersJoined.filter(id => id !== userId);
  saveAllData(data);
  
  return event;
};

/**
 * Get total donated time by user
 */
export const getTotalDonatedTime = (userId: string): number => {
  const donations = getUserDonations(userId);
  return donations
    .filter(d => d.type === 'time')
    .reduce((total, d) => total + d.amount, 0);
};

/**
 * Get total donated items by user
 */
export const getTotalDonatedItems = (userId: string): number => {
  const donations = getUserDonations(userId);
  return donations
    .filter(d => d.type === 'item')
    .reduce((total, d) => total + d.amount, 0);
};

/**
 * Export data as JSON and trigger download
 */
export const exportDataAsJSON = (): string => {
  const data = loadAllData();
  return JSON.stringify(data, null, 2);
};

/**
 * Download current data as JSON file
 */
export const downloadDataAsJSON = (): void => {
  const jsonData = exportDataAsJSON();
  const element = document.createElement('a');
  const file = new Blob([jsonData], { type: 'application/json' });
  element.href = URL.createObjectURL(file);
  element.download = `8vents_data_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Upload and merge JSON file data
 */
export const uploadDataFromJSON = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        // Merge with existing data (imported data takes precedence)
        const mergedData: AppData = {
          users: [...loadAllData().users, ...importedData.users].filter((u, i, arr) => 
            arr.findIndex(a => a.id === u.id) === i
          ),
          events: [...loadAllData().events, ...importedData.events].filter((e, i, arr) => 
            arr.findIndex(a => a.id === e.id) === i
          ),
          donations: [...loadAllData().donations, ...importedData.donations].filter((d, i, arr) => 
            arr.findIndex(a => a.id === d.id) === i
          ),
          blogs: [...loadAllData().blogs, ...importedData.blogs].filter((b, i, arr) => 
            arr.findIndex(a => a.id === b.id) === i
          ),
          lastUpdated: new Date().toISOString(),
        };
        saveAllData(mergedData);
        resolve(mergedData);
      } catch (error) {
        reject(new Error('Invalid JSON file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Get user-specific data for export
 */
export const getUserDataAsJSON = (userId: string): string => {
  const data = loadAllData();
  const user = data.users.find(u => u.id === userId);
  const userDonations = data.donations.filter(d => d.userId === userId);
  
  const userData = {
    user,
    donations: userDonations,
    stats: {
      totalDonations: userDonations.length,
      totalTime: userDonations.filter(d => d.type === 'time').reduce((sum, d) => sum + d.amount, 0),
      totalItems: userDonations.filter(d => d.type === 'item').reduce((sum, d) => sum + d.amount, 0),
      exportedAt: new Date().toISOString(),
    }
  };
  
  return JSON.stringify(userData, null, 2);
};

/**
 * Download user-specific data as JSON
 */
export const downloadUserDataAsJSON = (userId: string, userName: string): void => {
  const jsonData = getUserDataAsJSON(userId);
  const element = document.createElement('a');
  const file = new Blob([jsonData], { type: 'application/json' });
  element.href = URL.createObjectURL(file);
  element.download = `${userName.replace(/\s+/g, '_')}_profile_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Import user profile from JSON file
 */
export const importUserProfileFromJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const userData = JSON.parse(event.target?.result as string);
        const data = loadAllData();
        
        // Update or add user
        const userIndex = data.users.findIndex(u => u.id === userData.user.id);
        if (userIndex >= 0) {
          data.users[userIndex] = userData.user;
        } else {
          data.users.push(userData.user);
        }
        
        // Add new donations
        userData.donations.forEach((donation: any) => {
          if (!data.donations.find(d => d.id === donation.id)) {
            data.donations.push(donation);
          }
        });
        
        saveAllData(data);
        resolve(userData);
      } catch (error) {
        reject(new Error('Invalid user profile JSON format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export default {
  initializeAppData,
  loadDataFromFile,
  loadAllData,
  saveAllData,
  addDonation,
  getDonations,
  getUserDonations,
  addVolunteer,
  getVolunteers,
  addEvent,
  getEvents,
  getEventById,
  addUserToEvent,
  removeUserFromEvent,
  getTotalDonatedTime,
  getTotalDonatedItems,
  exportDataAsJSON,
  downloadDataAsJSON,
  uploadDataFromJSON,
  getUserDataAsJSON,
  downloadUserDataAsJSON,
  importUserProfileFromJSON,
};
