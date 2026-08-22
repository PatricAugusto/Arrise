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
  violet: '#A7A7A0',
  aurora: '#F4F4EF',
  ember: '#8C8C84',
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
        <View className="flex-row items-center mb-2">
          <View className="mr-2 h-2 w-2 rounded-full bg-aurora-500" />
          <Text className="font-mono text-[10px] tracking-[2px] text-aurora-500">ARRISE://SIGNALS</Text>
        </View>
        <Text className="text-text font-display text-3xl mb-1">Seu progresso</Text>
        <Text className="text-text-dim font-body text-sm mb-5">A consistência deixa um rastro.</Text>

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

        <Text className="text-text font-body-semibold text-sm mb-3">Progresso semanal</Text>

        {habits.map((habit) => (
          <GlassCard key={habit.id} className="flex-row items-center p-4 mb-3">
            <ProgressRing
              progress={habit.weekProgress}
              size={64}
              strokeWidth={6}
              color={RING_COLOR[habit.color]}
              label={`${Math.round(habit.weekProgress * 100)}`}
            />
            <View className="ml-4 flex-1">
              <Text className="font-body-semibold text-text text-base">{habit.title}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="flame-outline" size={12} color="#8C8C84" />
                <Text className="font-mono text-xs text-text-dim ml-1">
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