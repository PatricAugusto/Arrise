import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface CyberPulseProps {
  color?: string;
  size?: number;
}

export function CyberPulse({ color = '#D7FF3F', size = 6 }: CyberPulseProps) {
  const glow = useSharedValue(0.45);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 850, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.45, { duration: 850, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.9 + glow.value * 0.1 }],
  }));

  return (
    <Animated.View style={glowStyle}>
      <View style={{ width: size, height: size, backgroundColor: color }} />
    </Animated.View>
  );
}
