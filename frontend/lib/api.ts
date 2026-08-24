import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarData, Habit, HabitColor } from '@/lib/types';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const isAndroidEmulator = Platform.OS === 'android' && !Constants.isDevice;
const apiHost = expoHost || (isAndroidEmulator ? '10.0.2.2' : 'localhost');
const API_URL = (configuredApiUrl || `http://${apiHost}:3000/api`).replace(/^https:\/\//, 'http://');
const REQUEST_TIMEOUT_MS = 5000;
const LOCAL_HABITS_KEY = '@arrise/local-habits';
const AUTH_TOKEN_KEY = '@arrise/auth-token';

type HabitInput = Pick<Habit, 'title' | 'icon' | 'color'>;
type HabitUpdate = Partial<HabitInput> & Partial<Pick<Habit, 'completedToday'>>;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Tempo esgotado ao conectar em ${API_URL}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API error ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export function getHabits() {
  return request<Habit[]>('/habits').then(async (habits) => {
    if (!Array.isArray(habits)) throw new Error('Resposta inválida ao carregar tarefas.');
    await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(habits));
    return habits;
  }).catch(async (error) => {
    const stored = await AsyncStorage.getItem(LOCAL_HABITS_KEY);
    if (stored) return JSON.parse(stored) as Habit[];
    throw error;
  });
}

export function getCalendar(month: string) {
  return request<CalendarData>(`/habits/calendar?month=${encodeURIComponent(month)}`);
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string) {
  const result = await request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);
  return result.user;
}

export async function register(name: string, email: string, password: string) {
  const result = await request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);
  return result.user;
}

export function forgotPassword(email: string) {
  return request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function clearAuthToken() {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function getAuthToken() {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function createHabit(input: HabitInput) {
  try {
    const habit = await request<Habit>('/habits', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(await getCachedHabits()));
    return habit;
  } catch (error) {
    if (error instanceof Error && /401|403|Faça login/i.test(error.message)) throw error;
    const habits = await getCachedHabits();
    const habit: Habit = {
      ...input,
      id: `local-${Date.now()}`,
      streak: 0,
      completedToday: false,
      weekProgress: 0,
    };
    await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify([...habits, habit]));
    return habit;
  }
}

async function getCachedHabits() {
  const stored = await AsyncStorage.getItem(LOCAL_HABITS_KEY);
  return stored ? JSON.parse(stored) as Habit[] : [];
}

export async function updateHabit(id: string, input: HabitUpdate) {
  try {
    const habit = await request<Habit>(`/habits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    const habits = await getCachedHabits();
    await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(habits.map((item) => item.id === id ? habit : item)));
    return habit;
  } catch (error) {
    if (error instanceof Error && /401|403|Faça login/i.test(error.message)) throw error;
    const habits = await getCachedHabits();
    const current = habits.find((item) => item.id === id);
    if (!current) throw new Error('Habit not found');
    const habit = { ...current, ...input };
    await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(habits.map((item) => item.id === id ? habit : item)));
    return habit;
  }
}

export async function deleteHabit(id: string) {
  try {
    await request<void>(`/habits/${id}`, { method: 'DELETE' });
  } catch {
    // Keep local mode usable when the API is offline.
  }
  const habits = await getCachedHabits();
  await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(habits.filter((item) => item.id !== id)));
}

export async function reorderHabits(ids: string[]) {
  try {
    const habits = await request<Habit[]>('/habits/reorder', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
    await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(habits));
    return habits;
  } catch {
    const habits = await getCachedHabits();
    const byId = new Map(habits.map((habit) => [habit.id, habit]));
    const reordered = ids.map((id) => byId.get(id)).filter((habit): habit is Habit => Boolean(habit));
    await AsyncStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(reordered));
    return reordered;
  }
}

export { API_URL };
