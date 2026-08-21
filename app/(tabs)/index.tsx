import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
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
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-text-dim font-body text-sm">Bom dia,</Text>
          <Text className="text-text font-display text-3xl">seus hábitos</Text>
        </View>
        <Pressable
          onPress={(e) => toggleAt(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          hitSlop={12}
        >
          <Text className="text-2xl">{theme === "dark" ? "🌙" : "☀️"}</Text>
        </Pressable>
      </View>

      <View className="items-center py-4">
        <ProgressRing
          progress={percentage}
          size={104}
          strokeWidth={9}
          label={`${Math.round(percentage * 100)}%`}
          sublabel={`${completedCount}/${habits.length} hoje`}
        />
      </View>

      <Text className="px-5 text-text-dim font-body text-xs mb-1">
        Arraste um card → para concluir, ← para remover
      </Text>

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
