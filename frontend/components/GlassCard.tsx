import { View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { YStack } from 'tamagui';
import { useTheme } from '@/lib/theme';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  className?: string;
}

export function GlassCard({ intensity = 30, className = '', style, children, ...rest }: GlassCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (Platform.OS === 'android') {
    return (
      <YStack
        className={`rounded-glass overflow-hidden border border-glass-border/10 dark:border-glass-border/[0.1] bg-bg-elevated/80 dark:bg-bg-elevated/70 ${className}`}
        style={style}
      >
        <View {...rest}>{children}</View>
      </YStack>
    );
  }

  return (
    <YStack className={`rounded-glass overflow-hidden ${className}`} style={style}>
        <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        className="border border-glass-border/15 dark:border-glass-border/[0.12] bg-glass/45 dark:bg-glass/[0.06]"
      >
        <View {...rest}>{children}</View>
      </BlurView>
    </YStack>
  );
}