const PROFILE_KEY = 'safebite_user_profile';
const LEGACY_PROFILE_KEY = 'foodcheck_user_profile';
const HISTORY_KEY = 'safebite_scan_history';
const LEGACY_HISTORY_KEY = 'foodcheck_scan_history';

export const ALLERGEN_OPTIONS = [
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'tree_nuts', label: 'Tree Nuts' },
  { id: 'dairy', label: 'Dairy / Milk' },
  { id: 'gluten', label: 'Gluten / Wheat' },
  { id: 'soy', label: 'Soy / Soya' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'fish', label: 'Fish' },
  { id: 'sesame', label: 'Sesame' }
];

export const HEALTH_GOAL_OPTIONS = [
  { id: 'hypertension', label: 'Low Sodium (Hypertension)' },
  { id: 'diabetes', label: 'Low Sugar (Diabetes)' },
  { id: 'celiac', label: 'Strict Celiac Disease' },
  { id: 'lactose_intolerance', label: 'Lactose Free' },
  { id: 'none', label: 'None / Custom Condition' }
];

export const DIETARY_OPTIONS = [
  { id: 'halal', label: 'Halal Only' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'kosher', label: 'Kosher' }
];

export const ADDITIVE_OPTIONS = [];

export const DEFAULT_PROFILE = {
  onboarded: false,
  allergies: ['dairy', 'peanuts'],
  health_goals: ['hypertension'],
  dietary_restrictions: [],
  custom_condition: '',
  updated_at: new Date().toISOString()
};

export function getUserProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY) || localStorage.getItem(LEGACY_PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load user profile from localStorage:', e);
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile) {
  try {
    const updated = {
      ...profile,
      onboarded: true,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save profile to localStorage:', e);
    return profile;
  }
}

export function getScanHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY) || localStorage.getItem(LEGACY_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load history:', e);
    return [];
  }
}

export function addScanToHistory(entry) {
  try {
    const current = getScanHistory();
    const newEntry = {
      id: 'scan_' + Date.now(),
      timestamp: new Date().toISOString(),
      ...entry
    };
    const updated = [newEntry, ...current].slice(0, 20); // Keep last 20
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save scan to history:', e);
    return [];
  }
}

export function clearScanHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}
