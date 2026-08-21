import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { Habit } from "@/lib/types";
import { HabitCard } from "@/components/HabitCard";
import { ProgressRing } from "@/components/ProgressRing";
import { HabitFormModal } from "@/components/HabitFormModal";
import { createHabit, deleteHabit, getHabits, updateHabit } from "@/lib/api";

export default function TodayScreen() {
  const { theme, toggleAt } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      setHabits(await getHabits());
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Não foi possível conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleToggle = async (id: string) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;
    try {
      const updatedHabit = await updateHabit(id, { completedToday: !habit.completedToday });
      setHabits((prev) => prev.map((item) => (item.id === id ? updatedHabit : item)));
    } catch {
      setApiError("Não foi possível atualizar este hábito.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHabit(id);
      setHabits((prev) => prev.filter((habit) => habit.id !== id));
    } catch {
      setApiError("Não foi possível excluir este hábito.");
    }
  };

  const handleDeleteHabit = (habit: Habit) => {
    void handleDelete(habit.id);
    setFormVisible(false);
    setEditingHabit(null);
  };

  const openCreateForm = () => {
    setEditingHabit(null);
    setFormVisible(true);
  };

  const openEditForm = (habit: Habit) => {
    setEditingHabit(habit);
    setFormVisible(true);
  };

  const handleSaveHabit = async (data: Pick<Habit, "title" | "icon" | "color">) => {
    try {
      if (editingHabit) {
        const updatedHabit = await updateHabit(editingHabit.id, data);
        setHabits((prev) => prev.map((habit) => (habit.id === editingHabit.id ? updatedHabit : habit)));
      } else {
        const newHabit = await createHabit(data);
        setHabits((prev) => [...prev, newHabit]);
      }
      setFormVisible(false);
      setEditingHabit(null);
    } catch {
      setApiError("Não foi possível salvar este hábito.");
    }
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
          <View className="items-center mt-10">
            <Text className="text-text-dim font-body text-center">
              {isLoading ? "Sincronizando hábitos..." : apiError ?? "Nenhum hábito por aqui. Adicione um novo sinal."}
            </Text>
            {!!apiError && !isLoading && (
              <Pressable onPress={loadHabits} className="mt-4 rounded-xl border border-aurora-500/30 px-4 py-2">
                <Text className="text-aurora-500 font-body-medium text-xs">Tentar novamente</Text>
              </Pressable>
            )}
          </View>
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
        onDelete={handleDeleteHabit}
      />
    </SafeAreaView>
  );
}
