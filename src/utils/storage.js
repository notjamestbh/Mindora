// Storage management abstraction for Mindora using localStorage
import {
  initialPatient,
  initialMemories,
  initialReminders,
  initialActivities,
  initialTrendData7d,
  initialTrendData30d,
  initialAlerts,
  initialSettings
} from '../data/defaultData';

const STORAGE_KEYS = {
  PATIENT: "mindora_patient",
  MEMORIES: "mindora_memories",
  REMINDERS: "mindora_reminders",
  ACTIVITIES: "mindora_activities",
  TREND_7D: "mindora_trend_7d",
  TREND_30D: "mindora_trend_30d",
  ALERTS: "mindora_alerts",
  SETTINGS: "mindora_settings"
};

// Safe parse helper
const getFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
};

const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }
};

// --- Patient ---
export const getPatient = () => getFromStorage(STORAGE_KEYS.PATIENT, initialPatient);
export const savePatient = (patient) => {
  setToStorage(STORAGE_KEYS.PATIENT, patient);
  return patient;
};

// --- Memories ---
export const getMemories = () => getFromStorage(STORAGE_KEYS.MEMORIES, initialMemories);
export const saveMemories = (memories) => {
  setToStorage(STORAGE_KEYS.MEMORIES, memories);
  return memories;
};
export const addMemory = (memory) => {
  const current = getMemories();
  const newMemory = {
    ...memory,
    id: memory.id || `mem_${Date.now()}`
  };
  const updated = [newMemory, ...current];
  saveMemories(updated);
  return updated;
};
export const deleteMemory = (id) => {
  const current = getMemories();
  const updated = current.filter(m => m.id !== id);
  saveMemories(updated);
  return updated;
};

// --- Activities ---
export const getActivities = () => getFromStorage(STORAGE_KEYS.ACTIVITIES, initialActivities);
export const saveActivities = (activities) => {
  setToStorage(STORAGE_KEYS.ACTIVITIES, activities);
  return activities;
};
export const recordActivity = (activity) => {
  const current = getActivities();
  const newEntry = {
    ...activity,
    id: activity.id || `act_${Date.now()}`,
    date: new Date().toISOString(),
    timeStr: "Just now"
  };
  const updated = [newEntry, ...current];
  saveActivities(updated);

  // Update trend data for today
  updateTodayTrend(newEntry);
  return newEntry;
};

// Internal: update trend point
const updateTodayTrend = (activity) => {
  const trends = getTrendData('7d');
  if (!trends || trends.length === 0) return;
  
  const lastIndex = trends.length - 1;
  const today = { ...trends[lastIndex] };

  // Adjust metrics based on activity
  if (activity.type === 'memory-match' || activity.type === 'who-is-this') {
    today.memory = Math.min(100, Math.round((today.memory * 4 + activity.accuracy) / 5));
    today.recognition = Math.min(100, Math.round((today.recognition * 4 + activity.accuracy) / 5));
  } else if (activity.type === 'pattern') {
    today.attention = Math.min(100, Math.round((today.attention * 4 + activity.accuracy) / 5));
  }

  if (activity.responseTimeSec) {
    today.responseTimeSec = Math.round((today.responseTimeSec + activity.responseTimeSec) / 2);
  }

  trends[lastIndex] = today;
  setToStorage(STORAGE_KEYS.TREND_7D, trends);
};

// --- Reminders ---
export const getReminders = () => getFromStorage(STORAGE_KEYS.REMINDERS, initialReminders);
export const saveReminders = (reminders) => {
  setToStorage(STORAGE_KEYS.REMINDERS, reminders);
  return reminders;
};
export const toggleReminder = (id) => {
  const current = getReminders();
  const updated = current.map(r => {
    if (r.id === id) {
      const isCompleted = !r.completed;
      return {
        ...r,
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
      };
    }
    return r;
  });
  saveReminders(updated);
  return updated;
};
export const addReminder = (reminder) => {
  const current = getReminders();
  const newRem = {
    ...reminder,
    id: reminder.id || `rem_${Date.now()}`,
    completed: false,
    completedAt: null
  };
  const updated = [...current, newRem];
  saveReminders(updated);
  return updated;
};

// --- Trends ---
export const getTrendData = (timeframe = '7d') => {
  if (timeframe === '30d') {
    return getFromStorage(STORAGE_KEYS.TREND_30D, initialTrendData30d);
  }
  return getFromStorage(STORAGE_KEYS.TREND_7D, initialTrendData7d);
};

// --- Alerts ---
export const getAlerts = () => getFromStorage(STORAGE_KEYS.ALERTS, initialAlerts);
export const dismissAlert = (id) => {
  const current = getAlerts();
  const updated = current.filter(a => a.id !== id);
  setToStorage(STORAGE_KEYS.ALERTS, updated);
  return updated;
};

// --- Settings ---
export const getSettings = () => getFromStorage(STORAGE_KEYS.SETTINGS, initialSettings);
export const saveSettings = (settings) => {
  setToStorage(STORAGE_KEYS.SETTINGS, settings);
  // Apply immediate document attributes
  applySettingsToDOM(settings);
  return settings;
};

export const applySettingsToDOM = (settings) => {
  if (!settings) return;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-text-size', settings.textSize || 'normal');
    document.documentElement.setAttribute('data-high-contrast', settings.highContrast ? 'true' : 'false');
    document.documentElement.setAttribute('data-sound', settings.soundEnabled ? 'true' : 'false');
    document.documentElement.setAttribute('lang', settings.language || 'en');
  }
};

// Reset demo to fresh state
export const resetToDefaults = () => {
  localStorage.removeItem(STORAGE_KEYS.PATIENT);
  localStorage.removeItem(STORAGE_KEYS.MEMORIES);
  localStorage.removeItem(STORAGE_KEYS.REMINDERS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  localStorage.removeItem(STORAGE_KEYS.TREND_7D);
  localStorage.removeItem(STORAGE_KEYS.TREND_30D);
  localStorage.removeItem(STORAGE_KEYS.ALERTS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  applySettingsToDOM(initialSettings);
  return true;
};
