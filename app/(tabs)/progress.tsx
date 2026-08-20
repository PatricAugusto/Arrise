import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';

export default function ProgressScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="px-5 pt-4">
        <Text className="text-text font-display text-3xl mb-4">Progresso</Text>
        <GlassCard className="p-6">
          <Text className="text-text-dim font-body">
            Aqui vamos colocar o anel de progresso animado e o histórico de streaks no próximo passo.
          </Text>
        </GlassCard>
      </View>
    </SafeAreaView>
  );
}