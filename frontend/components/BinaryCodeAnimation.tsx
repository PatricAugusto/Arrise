import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const BINARY_LINES = [
  '101101 001011 110010 010101',
  '011010 111001 001110 101100',
  '110100 010011 101101 001010',
  '001111 101100 011001 110101',
  '101010 011101 110100 010011',
  '010110 100101 001011 111000',
  '111001 010010 100111 011010',
  '001101 110010 010101 101100',
];

function BinaryLine({ value, index }: { value: string; index: number }) {
  const progress = useSharedValue(0.28);

  useEffect(() => {
    progress.value = withDelay(
      index * 130,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.28, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.3,
    transform: [{ translateX: (1 - progress.value) * 8 }],
  }));

  return (
    <Animated.Text style={animatedStyle} className="font-mono text-[12px] leading-7 tracking-[2px] text-aurora-500">
      {value}
    </Animated.Text>
  );
}

export function BinaryCodeAnimation() {
  return (
    <View pointerEvents="none" className="overflow-hidden" style={[StyleSheet.absoluteFillObject, styles.background]}>
      <View className="absolute -left-4 top-28 border-l border-aurora-500/30 pl-4">
        {BINARY_LINES.map((line, index) => (
          <BinaryLine key={line} value={line} index={index} />
        ))}
      </View>
      <View className="absolute -right-20 bottom-36 rotate-90 border-l border-ember-500/20 pl-4">
        {BINARY_LINES.slice(1, 5).map((line, index) => (
          <BinaryLine key={`secondary-${line}`} value={line} index={index + 3} />
        ))}
      </View>
    </View>
  );
}

const styles = {
  background: {
    zIndex: 0,
    elevation: 0,
  },
};
