import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, clearAuthToken, getAuthToken, login, register } from '@/lib/api';

const AUTH_USER_KEY = '@arrise/auth-user';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAuthToken(), AsyncStorage.getItem(AUTH_USER_KEY)])
      .then(([token, storedUser]) => {
        if (token && storedUser) setUser(JSON.parse(storedUser) as AuthUser);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistUser = async (nextUser: AuthUser) => {
    setUser(nextUser);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  };

  const signIn = async (email: string, password: string) => persistUser(await login(email, password));
  const signUp = async (name: string, email: string, password: string) => persistUser(await register(name, email, password));
  const signOut = async () => {
    await clearAuthToken();
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
