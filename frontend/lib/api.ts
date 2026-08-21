import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Habit, HabitColor } from '@/lib/types';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const isAndroidEmulator = Platform.OS === 'android' && !Constants.isDevice;
const apiHost = expoHost || (isAndroidEmulator ? '10.0.2.2' : 'localhost');
const API_URL = (configuredApiUrl || `http://${apiHost}:3000/api`).replace(/^https:\/\//, 'http://');
const REQUEST_TIMEOUT_MS = 5000;

type HabitInput = Pick<Habit, 'title' | 'icon' | 'color'>;
type HabitUpdate = Partial<HabitInput> & Partial<Pick<Habit, 'completedToday'>>;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
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
  return request<Habit[]>('/habits');
}

export function createHabit(input: HabitInput) {
  return request<Habit>('/habits', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateHabit(id: string, input: HabitUpdate) {
  return request<Habit>(`/habits/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteHabit(id: string) {
  return request<void>(`/habits/${id}`, { method: 'DELETE' });
}

export { API_URL };
