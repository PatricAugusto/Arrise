import { View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
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
      <View
        className={`rounded-glass overflow-hidden border border-glass-border/10 dark:border-glass-border/[0.08] bg-bg-elevated/80 dark:bg-bg-elevated/70 ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </View>
    );
  }

  return (
    <View className={`rounded-glass overflow-hidden ${className}`} style={style} {...rest}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        className="border border-glass-border/10 dark:border-glass-border/[0.08] bg-glass/40 dark:bg-glass/[0.04]"
      >
        {children}
      </BlurView>
    </View>
  );
}