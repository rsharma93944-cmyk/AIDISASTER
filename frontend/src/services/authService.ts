/**
 * ResQAI Authentication Service (Backend-Ready)
 * Currently backed by browser localStorage demo state;
 * structured for future API endpoints (e.g. POST /auth/login, POST /auth/register, GET /auth/me).
 */

export interface UserPreferences {
  severeAlerts: boolean;
  highRiskAlerts: boolean;
  rainfallWarnings: boolean;
  regionalUpdates: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferredRegion: string;
  accountType: 'Demo User' | 'Registered User' | 'Disaster Coordinator';
  memberSince: string;
  preferences: UserPreferences;
}

export const DEFAULT_DEMO_USER: User = {
  id: 'usr-demo-001',
  name: 'ResQAI Demo User',
  email: 'demo@resqai.app',
  preferredRegion: 'Northeast India (NER)',
  accountType: 'Demo User',
  memberSince: 'September 2026',
  preferences: {
    severeAlerts: true,
    highRiskAlerts: true,
    rainfallWarnings: true,
    regionalUpdates: false,
  }
};

const AUTH_STORAGE_KEY = 'resqai_auth_user';

export async function loginUser(email: string, _password?: string): Promise<User> {
  // In production, this will send: POST /auth/login { email, password }
  const existing = localStorage.getItem(AUTH_STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed.email.toLowerCase() === email.toLowerCase()) {
        return parsed;
      }
    } catch (_e) {}
  }

  const user: User = {
    ...DEFAULT_DEMO_USER,
    email: email.trim(),
    name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'ResQAI User',
    accountType: 'Registered User',
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export async function registerUser(name: string, email: string, preferredRegion: string): Promise<User> {
  // In production, this will send: POST /auth/register { name, email, password, preferredRegion }
  const newUser: User = {
    id: `usr-${Date.now().toString(36)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    preferredRegion: preferredRegion || 'Northeast India (NER)',
    accountType: 'Registered User',
    memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    preferences: {
      severeAlerts: true,
      highRiskAlerts: true,
      rainfallWarnings: true,
      regionalUpdates: true,
    }
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as User;
  } catch (_e) {
    return null;
  }
}

export async function updateUserPreferences(preferences: UserPreferences): Promise<User | null> {
  const user = getCurrentUser();
  if (!user) return null;
  const updated = { ...user, preferences };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function updateUserProfile(name: string, preferredRegion: string): Promise<User | null> {
  const user = getCurrentUser();
  if (!user) return null;
  const updated = { ...user, name, preferredRegion };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
