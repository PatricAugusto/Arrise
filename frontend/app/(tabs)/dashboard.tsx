import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BinaryCodeAnimation } from '@/components/BinaryCodeAnimation';
import { CyberPulse } from '@/components/CyberPulse';
import { GlassCard } from '@/components/GlassCard';
import { getCalendar, getHabits } from '@/lib/api';
import { Habit } from '@/lib/types';
import { useTheme } from '@/lib/theme';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function monthKey(date: Date) {
  return dateKey(new Date(date.getFullYear(), date.getMonth(), 1)).slice(0, 7);
}

function getLastSevenDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completionDates, setCompletionDates] = useState<Record<string, Set<string>>>({});
  const [hasError, setHasError] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [savedHabits, calendar] = await Promise.all([getHabits(), getCalendar(monthKey(new Date()))]);
      const dates: Record<string, Set<string>> = {};
      calendar.completions.forEach(({ date, habitId }) => {
        dates[date] ??= new Set<string>();
        dates[date].add(habitId);
      });
      const today = dateKey(new Date());
      const todayCompleted = new Set(savedHabits.filter((habit) => habit.completedToday).map((habit) => habit.id));
      if (todayCompleted.size > 0) dates[today] = todayCompleted;
      setHabits(savedHabits);
      setCompletionDates(dates);
      setHasError(false);
    } catch {
      const savedHabits = await getHabits().catch(() => [] as Habit[]);
      const today = dateKey(new Date());
      const todayCompleted = new Set(savedHabits.filter((habit) => habit.completedToday).map((habit) => habit.id));
      setHabits(savedHabits);
      setCompletionDates(todayCompleted.size > 0 ? { [today]: todayCompleted } : {});
      setHasError(true);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadDashboard();
  }, [loadDashboard]));

  const lastSevenDays = useMemo(() => getLastSevenDays(), []);
  const activeDays = lastSevenDays.filter((date) => (completionDates[dateKey(date)]?.size ?? 0) > 0).length;
  const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const averageProgress = habits.length === 0 ? 0 : Math.round((habits.reduce((sum, habit) => sum + habit.weekProgress, 0) / habits.length) * 100);
  const topHabit = habits.length > 0 ? [...habits].sort((a, b) => b.weekProgress - a.weekProgress || b.streak - a.streak)[0] : null;
  const maxDayCount = Math.max(1, ...lastSevenDays.map((date) => completionDates[dateKey(date)]?.size ?? 0));

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="flex-1">
        <View pointerEvents="none" className="absolute inset-0"><BinaryCodeAnimation /></View>
        <ScrollView className="z-10" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}>
          <View className="mb-2 flex-row items-center">
            <View className="mr-2"><CyberPulse color="#00E5FF" size={6} /></View>
            <Text className="font-mono text-[10px] tracking-[1.5px] text-aurora-600">ARRISE / DASHBOARD_04</Text>
          </View>
          <Text className="font-display text-[32px] leading-9 text-text">Visão de evolução</Text>
          <Text className="mb-5 mt-1 font-body text-sm text-text-dim">Sinais claros para ajustar seu ritmo.</Text>

          <View className="mb-4 flex-row gap-3">
            <GlassCard className="h-[112px] flex-1 border-l-2 border-l-aurora-500">
              <View className="flex-1 justify-between p-4">
                <Text className="font-mono text-[10px] tracking-[1px] text-text-dim">MÉDIA SEMANAL</Text>
                <View className="flex-row items-end justify-between">
                  <Text className="font-display text-3xl leading-8 text-text">{averageProgress}%</Text>
                  <Ionicons name="trending-up-outline" size={19} color={theme === 'dark' ? '#00E5FF' : '#087F8C'} />
                </View>
              </View>
            </GlassCard>
            <GlassCard className="h-[112px] flex-1 border-l-2 border-l-ember-500">
              <View className="flex-1 justify-between p-4">
                <Text className="font-mono text-[10px] tracking-[1px] text-text-dim">DIAS ATIVOS</Text>
                <View className="flex-row items-end justify-between">
                  <Text className="font-display text-3xl leading-8 text-text">{activeDays}<Text className="font-mono text-xs text-text-dim">/7</Text></Text>
                  <Ionicons name="pulse-outline" size={19} color="#FF4FD8" />
                </View>
              </View>
            </GlassCard>
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-body-semibold text-sm text-text">$ atividade recente</Text>
            <Text className="font-mono text-[10px] text-text-dim">{hasError ? 'LOCAL' : '7 DAYS'}</Text>
          </View>
          <GlassCard className="mb-4 border-t-2 border-t-aurora-500">
            <View className="p-4">
              <View className="mb-5 flex-row items-end justify-between">
                {lastSevenDays.map((date) => {
                  const count = completionDates[dateKey(date)]?.size ?? 0;
                  const height = Math.max(6, Math.round((count / maxDayCount) * 70));
                  const isToday = dateKey(date) === dateKey(new Date());
                  return (
                    <View key={dateKey(date)} className="items-center">
                      <View className="h-[76px] justify-end">
                        <View className={`w-6 rounded-t-md ${count > 0 ? isToday ? 'bg-signal-500' : 'bg-aurora-500' : 'bg-text-dim/15'}`} style={{ height }} />
                      </View>
                      <Text className={`mt-2 font-mono text-[10px] ${isToday ? 'text-aurora-600' : 'text-text-dim'}`}>{WEEKDAYS[date.getDay()]}</Text>
                    </View>
                  );
                })}
              </View>
              <View className="flex-row items-center justify-between border-t border-glass-border/10 pt-3">
                <Text className="font-body text-xs text-text-dim">{totalStreak} dias acumulados em sequências</Text>
                <Text className="font-mono text-[9px] text-aurora-600">LIVE</Text>
              </View>
            </View>
          </GlassCard>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-body-semibold text-sm text-text">$ consistência por hábito</Text>
            <Text className="font-mono text-[10px] text-text-dim">RANKING</Text>
          </View>
          <GlassCard className="border-l-2 border-l-ember-500/70">
            <View className="p-4">
              {habits.length === 0 ? (
                <Text className="font-body text-sm text-text-dim">Adicione hábitos para começar a visualizar sua evolução.</Text>
              ) : habits.map((habit, index) => (
                <View key={habit.id} className={`flex-row items-center ${index < habits.length - 1 ? 'mb-4' : ''}`}>
                  <Text className="mr-3 w-5 font-mono text-[10px] text-text-dim">0{index + 1}</Text>
                  <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-aurora-500/10">
                    <Ionicons name={habit.icon as any} size={16} color={theme === 'dark' ? '#00E5FF' : '#087F8C'} />
                  </View>
                  <View className="flex-1">
                    <View className="mb-1 flex-row items-center justify-between gap-2">
                      <Text className="flex-1 font-body-medium text-sm text-text" numberOfLines={1}>{habit.title}</Text>
                      <Text className="font-mono text-xs text-aurora-600">{Math.round(habit.weekProgress * 100)}%</Text>
                    </View>
                    <View className="h-1.5 overflow-hidden rounded-full bg-text-dim/15">
                      <View className="h-full rounded-full bg-aurora-500" style={{ width: `${Math.round(habit.weekProgress * 100)}%` }} />
                    </View>
                  </View>
                </View>
              ))}
              {topHabit && <Text className="mt-4 border-t border-glass-border/10 pt-3 font-mono text-[9px] text-text-dim">TOP SIGNAL // {topHabit.title.toUpperCase()}</Text>}
            </View>
          </GlassCard>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
