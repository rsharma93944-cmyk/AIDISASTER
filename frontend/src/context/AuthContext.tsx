import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserPreferences, 
  DEFAULT_DEMO_USER, 
  getCurrentUser, 
  loginUser, 
  registerUser, 
  logoutUser, 
  updateUserPreferences,
  updateUserProfile
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  register: (name: string, email: string, password: string, preferredRegion: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
  updateProfile: (name: string, preferredRegion: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user on mount
  useEffect(() => {
    try {
      const stored = getCurrentUser();
      if (stored) {
        setUser(stored);
      }
    } catch (_e) {
      console.error('Failed to load user auth state from localStorage');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    const loggedUser = await loginUser(email, password);
    setUser(loggedUser);
  };

  const loginAsDemo = async () => {
    localStorage.setItem('resqai_auth_user', JSON.stringify(DEFAULT_DEMO_USER));
    setUser(DEFAULT_DEMO_USER);
  };

  const register = async (name: string, email: string, _password: string, preferredRegion: string) => {
    const registeredUser = await registerUser(name, email, preferredRegion);
    setUser(registeredUser);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updatePreferences = async (preferences: UserPreferences) => {
    const updated = await updateUserPreferences(preferences);
    if (updated) {
      setUser(updated);
    }
  };

  const updateProfile = async (name: string, preferredRegion: string) => {
    const updated = await updateUserProfile(name, preferredRegion);
    if (updated) {
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        loginAsDemo,
        register,
        logout,
        updatePreferences,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
