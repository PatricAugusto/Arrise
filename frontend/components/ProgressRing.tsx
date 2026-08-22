import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

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
  color = '#F4F4EF',
  trackColor = 'rgba(157, 157, 149, 0.18)',
  label,
  sublabel,
}: ProgressRingProps) {
  const animatedProgress = useSharedValue(0);
  const binaryColumns = ['101', '0110', '1101', '001', '10110', '0101', '111', '0011'];

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress, animatedProgress]);

  const progressStyle = useAnimatedStyle(() => ({ width: `${animatedProgress.value * 100}%` }));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/20">
      <View className="absolute inset-0 flex-row justify-around px-1 opacity-80">
        {binaryColumns.map((column, index) => <BinaryColumn key={`${column}-${index}`} value={column} color={color} delay={index * 120} />)}
      </View>
      <View className="absolute inset-0 bg-bg/60" />
      {label && <View className="z-10 items-center"><Text className="font-mono text-2xl text-text">{label}</Text>{sublabel && <Text className="font-body text-text-dim text-xs">{sublabel}</Text>}</View>}
      <View className="absolute bottom-1 left-2 right-2 h-0.5 overflow-hidden rounded-full" style={{ backgroundColor: trackColor }}>
        <Animated.View className="h-full" style={[progressStyle, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function BinaryColumn({ value, color, delay }: { value: string; color: string; delay: number }) {
  const fall = useSharedValue(-18);

  useEffect(() => {
    fall.value = withDelay(delay, withRepeat(withTiming(18, { duration: 1500, easing: Easing.linear }), -1, false));
  }, [delay, fall]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: fall.value }] }));

  return <Animated.View style={style} className="w-2 items-center"><Text className="font-mono text-[9px] leading-3" style={{ color }}>{value.split('').join('\n')}</Text></Animated.View>;
}