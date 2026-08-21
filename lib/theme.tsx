import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme as useSystemColorScheme, Dimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

type ThemeMode = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  toggleAt: (x: number, y: number) => void;
}

const THEME_STORAGE_KEY = '@arrise/theme-mode';
const BG_DARK = '#070D12';
const BG_LIGHT = '#F1F4F6';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [hydrated, setHydrated] = useState(false);
  const [overlayColor, setOverlayColor] = useState(BG_DARK);

  const cx = useSharedValue(0);
  const cy = useSharedValue(0);
  const radius = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        setModeState(stored);
      }
      setHydrated(true);
    });
  }, []);

  const theme: ResolvedTheme = useMemo(() => {
    if (mode === 'system') return (systemScheme ?? 'dark') as ResolvedTheme;
    return mode;
  }, [mode, systemScheme]);

  useEffect(() => {
    if (!hydrated) return;
    setColorScheme(theme);
  }, [theme, hydrated, setColorScheme]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  };

  const applyThemeUnderCover = (targetTheme: ResolvedTheme) => {
    setMode(targetTheme);
    opacity.value = withTiming(0, { duration: 320, easing: Easing.inOut(Easing.quad) });
  };

  const toggleAt = (x: number, y: number) => {
    const { width, height } = Dimensions.get('window');
    const targetTheme: ResolvedTheme = theme === 'dark' ? 'light' : 'dark';

    const dx = Math.max(x, width - x);
    const dy = Math.max(y, height - y);
    const maxRadius = Math.sqrt(dx * dx + dy * dy);

    setOverlayColor(targetTheme === 'dark' ? BG_DARK : BG_LIGHT);
    cx.value = x;
    cy.value = y;
    radius.value = maxRadius;
    scale.value = 0;
    opacity.value = 1;

    scale.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(applyThemeUnderCover)(targetTheme);
    });
  };

  const toggle = () => {
    const { width, height } = Dimensions.get('window');
    toggleAt(width / 2, height / 2);
  };

  const overlayStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: cx.value - radius.value,
    top: cy.value - radius.value,
    width: radius.value * 2,
    height: radius.value * 2,
    borderRadius: radius.value,
    backgroundColor: overlayColor,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, toggle, toggleAt }}>
      <View style={{ flex: 1 }}>
        {children}
        <Animated.View pointerEvents="none" style={overlayStyle} />
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}