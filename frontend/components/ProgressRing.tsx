import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/lib/theme';

interface ProgressRingProps {
  /** 0 a 1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color,
  trackColor = 'rgba(157, 157, 149, 0.18)',
  label,
  sublabel,
}: ProgressRingProps) {
  const { theme } = useTheme();
  const resolvedColor = color ?? (theme === 'dark' ? '#F4F4EF' : '#087F8C');
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress, animatedProgress]);

  const progressStyle = useAnimatedStyle(() => ({ width: `${animatedProgress.value * 100}%` }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center overflow-hidden rounded-lg border border-glass-border/15 bg-bg-elevated">
      <View className="absolute inset-0 bg-bg/60" />
      {label && <View className="z-10 items-center"><Text className="font-mono text-2xl text-text">{label}</Text>{sublabel && <Text className="font-body text-text-dim text-xs">{sublabel}</Text>}</View>}
      <View className="absolute bottom-1 left-2 right-2 h-0.5 overflow-hidden rounded-full" style={{ backgroundColor: trackColor }}>
        <Animated.View className="h-full" style={[progressStyle, { backgroundColor: resolvedColor }]} />
      </View>
    </View>
  );
}

