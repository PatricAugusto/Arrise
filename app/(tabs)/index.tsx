import { useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme';
import { mockHabits } from '@/lib/mock-habits';
import { Habit } from '@/lib/types';
import { HabitCard } from '@/components/HabitCard';

export default function TodayScreen() {
  const { theme, toggle } = useTheme();
  const [habits, setHabits] = useState<Habit[]>(mockHabits);

  const handleToggle = (id: string) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, completedToday: !h.completedToday } : h)));
  };

  const completedCount = useMemo(() => habits.filter((h) => h.completedToday).length, [habits]);
  const percentage = Math.round((completedCount / habits.length) * 100);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5 pt-4 pb-2 flex-row items-start justify-between">
        <View>
          <Text className="text-text-dim font-body text-sm">Bom dia,</Text>
          <Text className="text-text font-display text-3xl">seus hábitos</Text>
        </View>
        <Text onPress={toggle} className="text-text-dim font-body text-xs mt-2">
          {theme === 'dark' ? '🌙' : '☀️'}
        </Text>
      </View>

      <View className="px-5 mb-4">
        <Text className="font-mono text-4xl text-text">
          {percentage}
          <Text className="text-lg text-text-dim">%</Text>
        </Text>
        <Text className="font-body text-text-dim text-sm">{completedCount} de {habits.length} concluídos hoje</Text>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        renderItem={({ item }) => <HabitCard habit={item} onToggle={handleToggle} />}
      />
    </SafeAreaView>
  );
}