import { Habit } from './types';

export const mockHabits: Habit[] = [
  { id: '1', title: 'Beber 2L de água', icon: 'water-outline', color: 'aurora', streak: 12, completedToday: true, weekProgress: 0.86 },
  { id: '2', title: 'Meditar 10 minutos', icon: 'sparkles-outline', color: 'violet', streak: 5, completedToday: false, weekProgress: 0.57 },
  { id: '3', title: 'Ler 20 páginas', icon: 'book-outline', color: 'violet', streak: 21, completedToday: false, weekProgress: 1 },
  { id: '4', title: 'Treinar', icon: 'barbell-outline', color: 'ember', streak: 3, completedToday: false, weekProgress: 0.43 },
];