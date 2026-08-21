export type HabitColor = 'violet' | 'aurora' | 'ember';

export interface Habit {
  id: string;
  title: string;
  /** Nome de um ícone do Ionicons, ex: "water-outline" */
  icon: string;
  color: HabitColor;
  streak: number;
  completedToday: boolean;
  /** 0 a 1 — usado na barra/anel de progresso semanal */
  weekProgress: number;
}