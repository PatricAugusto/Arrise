import { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { ProgressRing } from '@/components/ProgressRing';
import { HabitColor } from '@/lib/types';
import { Habit } from '@/lib/types';
import { getHabits } from '@/lib/api';

const RING_COLOR: Record<HabitColor, string> = {
  violet: '#B8C0CC',
  aurora: '#00D9FF',
  ember: '#FF4FD8',
};

export default function ProgressScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [apiError, setApiError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getHabits()
        .then((savedHabits) => {
          setHabits(savedHabits);
          setApiError(false);
        })
        .catch(() => setApiError(true));
    }, []),
  );

  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const bestStreak = habits.length ? Math.max(...habits.map((h) => h.streak)) : 0;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}>
        <View className="mb-2 flex-row items-center">
          <View className="mr-2 h-1.5 w-1.5 bg-aurora-500" />
          <Text className="font-mono text-[10px] tracking-[1.5px] text-aurora-500">ARRISE / ANALYTICS_02</Text>
        </View>
        <Text className="mb-1 text-text font-display text-[32px] leading-9">Seu progresso</Text>
        <Text className="mb-5 font-body text-sm text-text-dim">A consistência deixa um rastro.</Text>

        <View className="flex-row gap-3 mb-4">
          <GlassCard className="flex-1 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-[10px] text-text-dim">TOTAL</Text>
              <Ionicons name="flame-outline" size={18} color="#8C8C84" />
            </View>
            <Text className="font-display text-3xl text-text mt-3">{totalStreak}</Text>
            <Text className="font-body text-text-dim text-xs mt-1">dias somados</Text>
          </GlassCard>
          <GlassCard className="flex-1 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-[10px] text-text-dim">RECORD</Text>
              <Ionicons name="trophy-outline" size={18} color="#F4F4EF" />
            </View>
            <Text className="font-display text-3xl text-text mt-3">{bestStreak}</Text>
            <Text className="font-body text-text-dim text-xs mt-1">melhor streak</Text>
          </GlassCard>
        </View>

        <View className="mb-3 flex-row items-center justify-between"><Text className="font-body-semibold text-sm text-text">$ progresso semanal</Text><Text className="font-mono text-[10px] text-text-dim">LIVE</Text></View>

        {habits.map((habit) => (
          <GlassCard key={habit.id} className="mb-3 flex-row items-center p-4">
            <ProgressRing
              progress={habit.weekProgress}
              size={64}
              strokeWidth={6}
              color={RING_COLOR[habit.color]}
              label={`${Math.round(habit.weekProgress * 100)}`}
            />
            <View className="ml-4 flex-1">
              <View className="flex-row items-start justify-between gap-2">
                <Text className="flex-1 font-body-semibold text-base leading-5 text-text">{habit.title}</Text>
                <Text className="font-mono text-sm text-aurora-500">{Math.round(habit.weekProgress * 100)}%</Text>
              </View>
              <View className="mt-3 h-2 overflow-hidden rounded-full bg-text-dim/20" accessibilityLabel={`Progresso semanal de ${habit.title}`} accessibilityValue={{ min: 0, max: 100, now: Math.round(habit.weekProgress * 100) }}>
                <View className="h-full rounded-full bg-aurora-500" style={{ width: `${Math.round(habit.weekProgress * 100)}%` }} />
              </View>
              <View className="mt-2 flex-row items-center">
                <Ionicons name="flame-outline" size={13} color="#FF4FD8" />
                <Text className="ml-1 font-mono text-xs text-text-dim">
                  {habit.streak} {habit.streak === 1 ? 'dia' : 'dias'} seguidos
                </Text>
              </View>
            </View>
          </GlassCard>
        ))}

        {habits.length === 0 && (
          <Text className="mt-8 text-center font-body text-sm text-text-dim">
            {apiError ? 'Não foi possível carregar os dados do servidor.' : 'Adicione um hábito para começar a acompanhar seus sinais.'}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}