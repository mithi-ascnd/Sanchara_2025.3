import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  user_id: string;
  username: string;
  mode: 'blind' | 'deaf' | 'wheelchair';
  is_premium: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, mode: string) => Promise<void>;
  logout: () => Promise<void>;
  updateMode: (mode: string) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  loadUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load user error:', error);
      set({ isLoading: false });
    }
  },

  login: async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const user = await response.json();
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (username: string, email: string, password: string, mode: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, mode }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const userData = await response.json();
      // Auto login after registration
      await get().login(username, password);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  updateMode: async (mode: string) => {
    const { user } = get();
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${user.user_id}/mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      if (response.ok) {
        const updatedUser = { ...user, mode: mode as any };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
    } catch (error) {
      console.error('Update mode error:', error);
    }
  },

  upgradeToPremium: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${user.user_id}/premium`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedUser = { ...user, is_premium: true };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  },
}));
