import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { mockHabits } from "@/lib/mock-habits";
import { Habit } from "@/lib/types";
import { HabitCard } from "@/components/HabitCard";
import { ProgressRing } from "@/components/ProgressRing";

export default function TodayScreen() {
  const { theme, toggleAt } = useTheme();
  const [habits, setHabits] = useState<Habit[]>(mockHabits);

  const handleToggle = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, completedToday: !h.completedToday } : h,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const completedCount = useMemo(
    () => habits.filter((h) => h.completedToday).length,
    [habits],
  );
  const percentage = habits.length === 0 ? 0 : completedCount / habits.length;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="absolute -right-20 top-20 w-56 h-56 rounded-full bg-aurora-500/5" />
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 rounded-full bg-aurora-500 mr-2" />
            <Text className="text-aurora-500 font-mono text-[10px] tracking-[2px]">ARRISE / DAILY</Text>
          </View>
          <Text className="text-text-dim font-body text-sm">Bom dia, Alex</Text>
          <Text className="text-text font-display text-3xl">Seu ritmo hoje</Text>
        </View>
        <Pressable
          onPress={(e) => toggleAt(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          hitSlop={12}
          className="w-11 h-11 rounded-full border border-glass-border/10 items-center justify-center bg-bg-elevated/70"
        >
          <Ionicons name={theme === "dark" ? "moon-outline" : "sunny-outline"} size={18} color={theme === "dark" ? "#3CEFD8" : "#65787D"} />
        </Pressable>
      </View>

      <View className="mx-5 mt-2 mb-5 rounded-glass border border-aurora-500/20 bg-bg-elevated/80 px-5 py-5 flex-row items-center justify-between">
        <View>
          <Text className="text-text-dim font-mono text-[10px] tracking-[1.5px]">STATUS / CONSISTENCY</Text>
          <Text className="text-text font-display text-2xl mt-2">Em movimento</Text>
          <Text className="text-text-dim font-body text-xs mt-1">Pequenos sinais, todos os dias.</Text>
        </View>
        <ProgressRing
          progress={percentage}
          size={92}
          strokeWidth={7}
          label={`${Math.round(percentage * 100)}%`}
          sublabel={`${completedCount}/${habits.length} hoje`}
        />
      </View>

      <View className="px-5 flex-row items-center justify-between mb-2">
        <Text className="text-text font-body-semibold text-sm">Próximos sinais</Text>
        <Text className="text-text-dim font-mono text-[10px]">{String(habits.length).padStart(2, "0")} TRACKED</Text>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 120,
        }}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <Text className="text-text-dim font-body text-center mt-10">
            Nenhum hábito por aqui. Bom trabalho, ou hora de adicionar um novo
            👀
          </Text>
        }
      />
    </SafeAreaView>
  );
}
