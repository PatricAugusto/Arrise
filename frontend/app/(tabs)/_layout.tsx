import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { View, Platform } from 'react-native';
import { useTheme } from '@/lib/theme';

const ANDROID_TAB_BG_DARK = 'rgba(8, 11, 17, 0.96)';
const ANDROID_TAB_BG_LIGHT = 'rgba(246, 248, 250, 0.96)';

export default function TabsLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: isDark ? '#F4F4EF' : '#121212',
        tabBarInactiveTintColor: isDark ? '#777770' : '#676761',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor:
            Platform.OS === 'android' ? (isDark ? ANDROID_TAB_BG_DARK : ANDROID_TAB_BG_LIGHT) : 'transparent',
          height: 74,
          paddingTop: 5,
        },
        tabBarBackground:
          Platform.OS === 'android'
            ? undefined
            : () => (
                <View className="flex-1 overflow-hidden border-t border-aurora-500/15">
                  <BlurView intensity={65} tint={isDark ? 'dark' : 'light'} style={{ flex: 1 }} />
                </View>
              ),
        tabBarLabelStyle: { fontFamily: 'SpaceMono_400Regular', fontSize: 10 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoje', tabBarIcon: ({ color, size }) => <Ionicons name="pulse-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progresso', tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendário', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}