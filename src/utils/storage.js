const PROFILE_KEY = 'foodcheck_user_profile';
const HISTORY_KEY = 'foodcheck_scan_history';

export const ALLERGEN_OPTIONS = [
  { id: 'peanuts', label: 'Peanuts', icon: '🥜' },
  { id: 'tree_nuts', label: 'Tree Nuts', icon: '🌰' },
  { id: 'dairy', label: 'Dairy / Milk', icon: '🥛' },
  { id: 'gluten', label: 'Gluten / Wheat', icon: '🌾' },
  { id: 'soy', label: 'Soy / Soya', icon: '🫘' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'shellfish', label: 'Shellfish', icon: '🦐' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'sesame', label: 'Sesame', icon: '🌱' }
];

export const HEALTH_GOAL_OPTIONS = [
  { id: 'hypertension', label: 'Low Sodium (Hypertension)', icon: '🧂' },
  { id: 'diabetes', label: 'Low Sugar (Diabetes)', icon: '🩺' },
  { id: 'celiac', label: 'Strict Celiac Disease', icon: '🚫' },
  { id: 'lactose_intolerance', label: 'Lactose Free', icon: '🧀' }
];

export const DIETARY_OPTIONS = [
  { id: 'halal', label: 'Halal Only', icon: '🌙' },
  { id: 'vegan', label: 'Vegan', icon: '🥬' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'kosher', label: 'Kosher', icon: '✡️' }
];

export const ADDITIVE_OPTIONS = [
  { id: 'E621', label: 'MSG (E621)', icon: '🧪' },
  { id: 'E102', label: 'Tartrazine (E102)', icon: '🟡' },
  { id: 'artificial_sweeteners', label: 'Aspartame / Sucralose', icon: '🍬' },
  { id: 'nitrites', label: 'Sodium Nitrite (E250)', icon: '🥓' }
];

export const DEFAULT_PROFILE = {
  onboarded: false,
  allergies: ['dairy', 'peanuts'],
  health_goals: ['hypertension'],
  dietary_restrictions: [],
  flagged_additives: ['E621'],
  updated_at: new Date().toISOString()
};

export function getUserProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
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
    const raw = localStorage.getItem(HISTORY_KEY);
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
