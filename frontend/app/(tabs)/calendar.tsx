import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BinaryCodeAnimation } from '@/components/BinaryCodeAnimation';
import { CyberPulse } from '@/components/CyberPulse';
import { GlassCard } from '@/components/GlassCard';
import { Habit } from '@/lib/types';
import { getCalendar, getHabits } from '@/lib/api';
import { useTheme } from '@/lib/theme';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function monthKey(date: Date) {
  return dateKey(new Date(date.getFullYear(), date.getMonth(), 1)).slice(0, 7);
}

function getMonthDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return [...Array(firstDay).fill(null), ...Array.from({ length: lastDay }, (_, index) => index + 1)];
}

export default function CalendarScreen() {
  const { theme } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [completionKeys, setCompletionKeys] = useState<Set<string>>(new Set());
  const [completedByDate, setCompletedByDate] = useState<Record<string, Set<string>>>({});
  const [hasError, setHasError] = useState(false);

  const loadCalendar = useCallback(async () => {
    let savedHabits: Habit[] = [];
    try {
      savedHabits = await getHabits();
      setHabits(savedHabits);
      const calendar = await getCalendar(monthKey(visibleMonth));
      const byDate: Record<string, Set<string>> = {};
      calendar.completions.forEach(({ date, habitId }) => {
        byDate[date] ??= new Set<string>();
        byDate[date].add(habitId);
      });
      const keys = new Set(calendar.completions.map((completion) => completion.date));
      const today = dateKey(new Date());
      if (monthKey(visibleMonth) === monthKey(new Date())) {
        const todayCompleted = new Set(savedHabits.filter((habit) => habit.completedToday).map((habit) => habit.id));
        if (todayCompleted.size > 0) {
          byDate[today] = todayCompleted;
          keys.add(today);
        }
      }
      setCompletedByDate(byDate);
      setCompletionKeys(keys);
      setHasError(false);
    } catch {
      const today = dateKey(new Date());
      const todayCompleted = new Set(savedHabits.filter((habit) => habit.completedToday).map((habit) => habit.id));
      setHabits(savedHabits);
      setCompletedByDate(todayCompleted.size > 0 ? { [today]: todayCompleted } : {});
      setCompletionKeys(todayCompleted.size > 0 ? new Set([today]) : new Set());
      setHasError(true);
    }
  }, [visibleMonth]);

  useFocusEffect(useCallback(() => {
    void loadCalendar();
  }, [loadCalendar]));

  const days = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const selectedKey = dateKey(selectedDate);
  const selectedHabitIds = completedByDate[selectedKey] ?? new Set<string>();
  const selectedCount = selectedHabitIds.size;
  const todayKey = dateKey(new Date());

  const moveMonth = (offset: number) => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(nextMonth);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="flex-1">
        <View pointerEvents="none" className="absolute inset-0">
          <BinaryCodeAnimation />
        </View>
        <ScrollView className="z-10" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}>
          <View className="mb-2 flex-row items-center">
            <View className="mr-2"><CyberPulse color="#00E5FF" size={6} /></View>
            <Text className="font-mono text-[10px] tracking-[1.5px] text-aurora-600">ARRISE / CALENDAR_03</Text>
          </View>
          <Text className="font-display text-[32px] leading-9 text-text">Seu acompanhamento</Text>
          <Text className="mb-5 mt-1 font-body text-sm text-text-dim">Um mapa simples da sua consistência.</Text>

          <GlassCard className="mb-4 border-t-2 border-t-aurora-500">
            <View className="p-4">
              <View className="mb-5 flex-row items-center justify-between">
                <Pressable onPress={() => moveMonth(-1)} className="h-9 w-9 items-center justify-center rounded-lg border border-glass-border/15" accessibilityRole="button" accessibilityLabel="Mês anterior">
                  <Ionicons name="chevron-back" size={17} color={theme === 'dark' ? '#F4F4EF' : '#12343B'} />
                </Pressable>
                <View className="items-center">
                  <Text className="font-display-medium text-lg capitalize text-text">{MONTHS[visibleMonth.getMonth()]}</Text>
                  <Text className="font-mono text-[10px] tracking-[1.5px] text-aurora-600">{visibleMonth.getFullYear()}</Text>
                </View>
                <Pressable onPress={() => moveMonth(1)} className="h-9 w-9 items-center justify-center rounded-lg border border-glass-border/15" accessibilityRole="button" accessibilityLabel="Próximo mês">
                  <Ionicons name="chevron-forward" size={17} color={theme === 'dark' ? '#F4F4EF' : '#12343B'} />
                </Pressable>
              </View>

              <View className="mb-2 flex-row">
                {WEEKDAYS.map((weekday, index) => <Text key={`${weekday}-${index}`} className="flex-1 text-center font-mono text-[10px] text-text-dim">{weekday}</Text>)}
              </View>
              <View className="flex-row flex-wrap">
                {days.map((day, index) => {
                  if (day === null) return <View key={`empty-${index}`} className="h-11 flex-1 basis-[14.28%]" />;
                  const dayDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
                  const key = dateKey(dayDate);
                  const isSelected = key === selectedKey;
                  const isToday = key === todayKey;
                  const isComplete = completionKeys.has(key);
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setSelectedDate(dayDate)}
                      className={`h-11 basis-[14.28%] items-center justify-center ${isSelected ? 'rounded-lg bg-aurora-500' : ''}`}
                      accessibilityRole="button"
                      accessibilityLabel={`${day} de ${MONTHS[visibleMonth.getMonth()]}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text className={`font-mono text-xs ${isSelected ? 'text-bg' : isToday ? 'font-bold text-aurora-600' : 'text-text'}`}>{day}</Text>
                      <View className={`mt-1 h-1 w-1 rounded-full ${isComplete ? isSelected ? 'bg-bg' : 'bg-aurora-500' : 'bg-transparent'}`} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </GlassCard>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-body-semibold text-sm text-text">$ sinal do dia</Text>
            <Text className="font-mono text-[10px] text-text-dim">{selectedCount}/{habits.length} DONE</Text>
          </View>
          <GlassCard className="border-l-2 border-l-ember-500/70">
            <View className="p-4">
              <View className="mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="font-display-medium text-lg text-text">{selectedKey === todayKey ? 'Hoje' : `${selectedDate.getDate()} de ${MONTHS[selectedDate.getMonth()]}`}</Text>
                  <Text className="mt-1 font-mono text-[10px] tracking-[1px] text-text-dim">{hasError ? 'MODO LOCAL' : 'REGISTRO DE HÁBITOS'}</Text>
                </View>
                <Ionicons name={selectedCount > 0 ? 'checkmark-circle-outline' : 'radio-button-off-outline'} size={24} color={selectedCount > 0 ? '#D7FF3F' : theme === 'dark' ? '#8793A1' : '#52606D'} />
              </View>
              {habits.length === 0 ? (
                <Text className="font-body text-sm text-text-dim">Adicione um hábito para começar a acompanhar seus dias.</Text>
              ) : habits.map((habit) => (
                <View key={habit.id} className="mb-3 flex-row items-center last:mb-0">
                  <View className={`mr-3 h-2 w-2 rounded-full ${selectedHabitIds.has(habit.id) ? 'bg-signal-500' : 'bg-text-dim/30'}`} />
                  <Text className={`flex-1 font-body text-sm ${selectedHabitIds.has(habit.id) ? 'text-text' : 'text-text-dim'}`}>{habit.title}</Text>
                  <Text className="font-mono text-[9px] text-text-dim">{selectedHabitIds.has(habit.id) ? 'DONE' : 'PENDING'}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
