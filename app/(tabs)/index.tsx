import { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { mockHabits } from "@/lib/mock-habits";
import { Habit } from "@/lib/types";
import { HabitCard } from "@/components/HabitCard";
import { ProgressRing } from "@/components/ProgressRing";
import { HabitFormModal } from "@/components/HabitFormModal";

const HABITS_STORAGE_KEY = "@arrise/habits";

export default function TodayScreen() {
  const { theme, toggleAt } = useTheme();
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  const [isHydrated, setIsHydrated] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(HABITS_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const savedHabits = JSON.parse(stored) as Habit[];
          if (Array.isArray(savedHabits)) setHabits(savedHabits);
        } catch {
          // Mantém os hábitos iniciais se o armazenamento estiver inválido.
        }
      }
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (isHydrated) AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  }, [habits, isHydrated]);

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

  const openCreateForm = () => {
    setEditingHabit(null);
    setFormVisible(true);
  };

  const openEditForm = (habit: Habit) => {
    setEditingHabit(habit);
    setFormVisible(true);
  };

  const handleSaveHabit = (data: Pick<Habit, "title" | "icon" | "color">) => {
    setHabits((prev) => {
      if (editingHabit) {
        return prev.map((habit) => (habit.id === editingHabit.id ? { ...habit, ...data } : habit));
      }
      return [
        ...prev,
        {
          ...data,
          id: `${Date.now()}`,
          streak: 0,
          completedToday: false,
          weekProgress: 0,
        },
      ];
    });
    setFormVisible(false);
    setEditingHabit(null);
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
        <Pressable onPress={openCreateForm} className="flex-row items-center" accessibilityLabel="Adicionar hábito">
          <Ionicons name="add" size={16} color="#3CEFD8" />
          <Text className="ml-1 text-aurora-500 font-body-medium text-xs">Novo</Text>
        </Pressable>
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
            onEdit={openEditForm}
          />
        )}
        ListEmptyComponent={
          <Text className="text-text-dim font-body text-center mt-10">
            Nenhum hábito por aqui. Bom trabalho, ou hora de adicionar um novo
            👀
          </Text>
        }
      />

      <Pressable
        onPress={openCreateForm}
        className="absolute bottom-24 right-5 h-14 w-14 items-center justify-center rounded-full bg-aurora-500 shadow-lg"
        accessibilityLabel="Adicionar hábito"
      >
        <Ionicons name="add" size={27} color="#071318" />
      </Pressable>

      <HabitFormModal
        visible={formVisible}
        habit={editingHabit}
        onClose={() => setFormVisible(false)}
        onSave={handleSaveHabit}
      />
    </SafeAreaView>
  );
}
