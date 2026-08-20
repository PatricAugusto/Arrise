import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { Habit, HabitColor } from '@/lib/types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
}

const COLOR_STYLES: Record<HabitColor, { iconBg: string; iconColor: string; ring: string; dot: string }> = {
  violet: { iconBg: 'bg-violet-500/15', iconColor: '#8B7DEE', ring: 'border-violet-500', dot: 'bg-violet-500' },
  aurora: { iconBg: 'bg-aurora-500/15', iconColor: '#3CEFD8', ring: 'border-aurora-500', dot: 'bg-aurora-500' },
  ember: { iconBg: 'bg-ember-500/15', iconColor: '#FFA37D', ring: 'border-ember-500', dot: 'bg-ember-500' },
};

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const colors = COLOR_STYLES[habit.color];

  return (
    <GlassCard className="mb-3">
      <Pressable onPress={() => onToggle(habit.id)} className="flex-row items-center px-4 py-4 active:opacity-70">
        <View className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${colors.iconBg}`}>
          <Ionicons name={habit.icon as any} size={20} color={colors.iconColor} />
        </View>

        <View className="flex-1">
          <Text className={`font-body-semibold text-base text-text ${habit.completedToday ? 'line-through text-text-dim' : ''}`}>
            {habit.title}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="flame" size={13} color="#FF8A5B" />
            <Text className="font-mono text-xs text-text-dim ml-1">
              {habit.streak} {habit.streak === 1 ? 'dia' : 'dias'}
            </Text>
          </View>
        </View>

        <View className={`w-7 h-7 rounded-full items-center justify-center border-2 ${habit.completedToday ? `${colors.ring} bg-transparent` : 'border-text-dim/30'}`}>
          {habit.completedToday && <View className={`w-3.5 h-3.5 rounded-full ${colors.dot}`} />}
        </View>
      </Pressable>
    </GlassCard>
  );
}