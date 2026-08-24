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
import { CyberPulse } from '@/components/CyberPulse';
import { useTheme } from '@/lib/theme';
import { BinaryCodeAnimation } from '@/components/BinaryCodeAnimation';

const RING_COLOR: Record<HabitColor, string> = {
  violet: '#B8C0CC',
  aurora: '#00D9FF',
  ember: '#FF4FD8',
};

export default function ProgressScreen() {
  const { theme } = useTheme();
  const mutedIconColor = theme === 'dark' ? '#8C8C84' : '#52606D';
  const accentIconColor = theme === 'dark' ? '#F4F4EF' : '#12343B';
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
      <View className="flex-1">
        <View pointerEvents="none" className="absolute inset-0">
          <BinaryCodeAnimation />
        </View>
        <ScrollView
          className="z-10"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}
        >
          <View className="mb-2 flex-row items-center">
            <View className="mr-2"><CyberPulse color="#00E5FF" size={6} /></View>
            <Text className="font-mono text-[10px] tracking-[1.5px] text-aurora-600">ARRISE / ANALYTICS_02</Text>
          </View>
          <Text className="mb-1 text-text font-display text-[32px] leading-9">Seu progresso</Text>
          <Text className="mb-5 font-body text-sm text-text-dim">A consistência deixa um rastro.</Text>

          <View className="mb-4 flex-row gap-3">
            <GlassCard className="h-[124px] flex-1 border-l-2 border-l-aurora-500">
              <View className="flex-1 justify-between p-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-mono text-[10px] tracking-[1px] text-text-dim">TOTAL</Text>
                <Ionicons name="flame-outline" size={18} color={mutedIconColor} />
              </View>
              <View className="flex-row items-end justify-between">
                <Text className="font-display text-3xl leading-8 text-text">{totalStreak}</Text>
                <Text className="pb-1 font-mono text-[9px] text-aurora-600">DAYS</Text>
              </View>
              </View>
            </GlassCard>
            <GlassCard className="h-[124px] flex-1 border-l-2 border-l-ember-500">
              <View className="flex-1 justify-between p-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-mono text-[10px] tracking-[1px] text-text-dim">RECORD</Text>
                <Ionicons name="trophy-outline" size={18} color={accentIconColor} />
              </View>
              <View className="flex-row items-end justify-between">
                <Text className="font-display text-3xl leading-8 text-text">{bestStreak}</Text>
                <Text className="pb-1 font-mono text-[9px] text-ember-600">BEST</Text>
              </View>
              </View>
            </GlassCard>
          </View>

          <View className="mb-3 flex-row items-center justify-between"><Text className="font-body-semibold text-sm text-text">$ progresso semanal</Text><Text className="font-mono text-[10px] text-text-dim">LIVE</Text></View>

          {habits.map((habit) => (
          <GlassCard key={habit.id} className="mb-3 border-l-2 border-l-aurora-500/60">
            <View className="flex-row items-center p-4">
              <View className="w-16 shrink-0">
                <ProgressRing
                  progress={habit.weekProgress}
                  size={64}
                  strokeWidth={6}
                  color={RING_COLOR[habit.color]}
                  label={`${Math.round(habit.weekProgress * 100)}`}
                />
              </View>
              <View className="ml-4 flex-1">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="flex-1 font-body-semibold text-base leading-5 text-text" numberOfLines={2}>{habit.title}</Text>
                  <Text className="font-mono text-sm text-aurora-600">{Math.round(habit.weekProgress * 100)}%</Text>
                </View>
                <View className="mt-3 h-2 overflow-hidden rounded-full bg-text-dim/20" accessibilityLabel={`Progresso semanal de ${habit.title}`} accessibilityValue={{ min: 0, max: 100, now: Math.round(habit.weekProgress * 100) }}>
                  <View className="h-full rounded-full bg-aurora-500" style={{ width: `${Math.round(habit.weekProgress * 100)}%` }} />
                </View>
                <View className="mt-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="flame-outline" size={13} color="#FF4FD8" />
                    <Text className="ml-1 font-mono text-xs text-text-dim">
                      {habit.streak} {habit.streak === 1 ? 'dia' : 'dias'} seguidos
                    </Text>
                  </View>
                  <Text className="font-mono text-[9px] text-text-dim">WEEKLY</Text>
                </View>
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
      </View>
    </SafeAreaView>
  );
}