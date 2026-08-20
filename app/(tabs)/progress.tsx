import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { ProgressRing } from '@/components/ProgressRing';
import { mockHabits } from '@/lib/mock-habits';
import { HabitColor } from '@/lib/types';

const RING_COLOR: Record<HabitColor, string> = {
  violet: '#8B7DEE',
  aurora: '#3CEFD8',
  ember: '#FFA37D',
};

export default function ProgressScreen() {
  const totalStreak = mockHabits.reduce((sum, h) => sum + h.streak, 0);
  const bestStreak = Math.max(...mockHabits.map((h) => h.streak));

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}>
        <Text className="text-text font-display text-3xl mb-4">Progresso</Text>

        <View className="flex-row gap-3 mb-4">
          <GlassCard className="flex-1 p-4 items-center">
            <Ionicons name="flame" size={20} color="#FF8A5B" />
            <Text className="font-mono text-2xl text-text mt-1">{totalStreak}</Text>
            <Text className="font-body text-text-dim text-xs">dias somados</Text>
          </GlassCard>
          <GlassCard className="flex-1 p-4 items-center">
            <Ionicons name="trophy" size={20} color="#8B7DEE" />
            <Text className="font-mono text-2xl text-text mt-1">{bestStreak}</Text>
            <Text className="font-body text-text-dim text-xs">melhor streak</Text>
          </GlassCard>
        </View>

        <Text className="text-text-dim font-body-medium text-sm mb-3">Progresso semanal por hábito</Text>

        {mockHabits.map((habit) => (
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
                <Ionicons name="flame" size={12} color="#FF8A5B" />
                <Text className="font-mono text-xs text-text-dim ml-1">
                  {habit.streak} {habit.streak === 1 ? 'dia' : 'dias'} seguidos
                </Text>
              </View>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}