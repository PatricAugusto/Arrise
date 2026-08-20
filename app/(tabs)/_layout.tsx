import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { View } from 'react-native';
import { useTheme } from '@/lib/theme';

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: theme === 'dark' ? '#8F96A8' : '#646A7A',
        tabBarStyle: { position: 'absolute', borderTopWidth: 0, elevation: 0, backgroundColor: 'transparent', height: 84, paddingTop: 8 },
        tabBarBackground: () => (
          <View className="flex-1 overflow-hidden border-t border-glass-border/10">
            <BlurView intensity={50} tint={theme === 'dark' ? 'dark' : 'light'} style={{ flex: 1 }} />
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