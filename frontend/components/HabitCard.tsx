import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { Habit, HabitColor } from '@/lib/types';
import { CyberPulse } from './CyberPulse';
import { useTheme } from '@/lib/theme';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDrag: () => void;
  isActive?: boolean;
  entranceDelay?: number;
}

const COLOR_STYLES: Record<HabitColor, { iconBg: string; iconColor: string; ring: string; dot: string }> = {
  violet: { iconBg: 'bg-violet-500/15', iconColor: '#C6C6BE', ring: 'border-violet-500', dot: 'bg-violet-500' },
  aurora: { iconBg: 'bg-aurora-500/15', iconColor: '#FFFFFF', ring: 'border-aurora-500', dot: 'bg-aurora-500' },
  ember: { iconBg: 'bg-ember-500/15', iconColor: '#B4B4AA', ring: 'border-ember-500', dot: 'bg-ember-500' },
};

const SWIPE_THRESHOLD = 88;
const MAX_SWIPE = 120;

export function HabitCard({ habit, onToggle, onDelete, onEdit, onDrag, isActive = false, entranceDelay = 0 }: HabitCardProps) {
  const colors = COLOR_STYLES[habit.color];
  const { theme } = useTheme();
  const mutedIconColor = theme === 'dark' ? '#8793A1' : '#52606D';
  const actionIconColor = theme === 'dark' ? '#F4F4EF' : '#12343B';

  const translateX = useSharedValue(0);
  const checkScale = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const entryProgress = useSharedValue(1);

  useEffect(() => {
    entryProgress.value = withDelay(entranceDelay, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    if (habit.completedToday) {
      checkScale.value = withSequence(withSpring(1.35, { damping: 6 }), withSpring(1, { damping: 8 }));
    }
  }, [habit.completedToday, entryProgress]);

  const triggerToggle = () => onToggle(habit.id);
  const triggerDelete = () => onDelete(habit.id);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      const raw = e.translationX;
      translateX.value = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, raw));
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        cardScale.value = withSequence(withTiming(0.97, { duration: 80 }), withTiming(1, { duration: 120 }));
        runOnJS(triggerToggle)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(triggerDelete)();
      }
      translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
    });

  const cardStyle = useAnimatedStyle(() => ({
    opacity: entryProgress.value,
    transform: [{ translateX: translateX.value }, { translateY: (1 - entryProgress.value) * 14 }, { scale: cardScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const completeActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.6, 1], Extrapolation.CLAMP) }],
  }));

  const deleteActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0.6], Extrapolation.CLAMP) }],
  }));

  return (
    <View className="mb-3">
      <View className="absolute inset-0 flex-row items-center justify-between px-6">
        <Animated.View style={completeActionStyle} className="flex-row items-center gap-2">
          <Ionicons name="checkmark-circle" size={26} color={actionIconColor} />
        </Animated.View>
        <Animated.View style={deleteActionStyle} className="flex-row items-center gap-2">
          <Ionicons name="trash" size={22} color={mutedIconColor} />
        </Animated.View>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={cardStyle} className={`rounded-glass bg-bg-elevated/95 ${isActive ? 'opacity-80' : ''}`}>
          <GlassCard className="border-l-2 border-l-aurora-500/60">
            <Pressable
              onPress={() => onToggle(habit.id)}
              onLongPress={onDrag}
              delayLongPress={180}
              accessibilityRole="checkbox"
              accessibilityLabel={`${habit.title}, ${habit.completedToday ? 'concluído' : 'pendente'}`}
              accessibilityHint="Pressione e segure para mover"
              accessibilityState={{ checked: habit.completedToday }}
              className="flex-row items-center px-4 py-4 active:opacity-70"
            >
              <View className={`mr-3 h-11 w-11 items-center justify-center rounded-lg ${colors.iconBg}`}>
                <Ionicons name={habit.icon as any} size={20} color={colors.iconColor} />
              </View>
              <View className="flex-1">
                <Text className={`font-body-semibold text-base leading-5 text-text ${habit.completedToday ? 'line-through text-text-dim' : ''}`}>
                  {habit.title}
                </Text>
                <View className="mt-1 flex-row items-center">
                  {habit.completedToday ? <CyberPulse color="#D7FF3F" size={5} /> : <Ionicons name="flame-outline" size={13} color={mutedIconColor} />}
                  <Text className="font-mono text-xs text-text-dim ml-1">
                    {habit.streak} {habit.streak === 1 ? 'dia' : 'dias'}
                  </Text>
                </View>
              </View>
              <Animated.View
                style={checkStyle}
                className={`w-7 h-7 rounded-full items-center justify-center border-2 ${habit.completedToday ? `${colors.ring} bg-transparent` : 'border-text-dim/30'}`}
              >
                {habit.completedToday && <View className={`w-3.5 h-3.5 rounded-full ${colors.dot}`} />}
              </Animated.View>
              <Pressable onPress={() => onEdit(habit)} hitSlop={10} className="ml-3" accessibilityLabel={`Editar ${habit.title}`}>
                <Ionicons name="ellipsis-horizontal" size={20} color={mutedIconColor} />
              </Pressable>
              <Ionicons name="reorder-three-outline" size={22} color={mutedIconColor} />
            </Pressable>
          </GlassCard>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}