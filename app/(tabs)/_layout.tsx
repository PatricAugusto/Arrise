import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { View, Platform } from 'react-native';
import { useTheme } from '@/lib/theme';

const ANDROID_TAB_BG_DARK = 'rgba(17, 22, 34, 0.92)';
const ANDROID_TAB_BG_LIGHT = 'rgba(255, 255, 255, 0.92)';

export default function TabsLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: isDark ? '#8F96A8' : '#646A7A',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor:
            Platform.OS === 'android' ? (isDark ? ANDROID_TAB_BG_DARK : ANDROID_TAB_BG_LIGHT) : 'transparent',
          height: 84,
          paddingTop: 8,
        },
        tabBarBackground:
          Platform.OS === 'android'
            ? undefined
            : () => (
                <View className="flex-1 overflow-hidden border-t border-glass-border/10">
                  <BlurView intensity={50} tint={isDark ? 'dark' : 'light'} style={{ flex: 1 }} />
                </View>
              ),
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoje', tabBarIcon: ({ color, size }) => <Ionicons name="today-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progresso', tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}