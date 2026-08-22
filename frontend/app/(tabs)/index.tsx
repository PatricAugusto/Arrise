import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Habit } from "@/lib/types";
import { HabitCard } from "@/components/HabitCard";
import { ProgressRing } from "@/components/ProgressRing";
import { HabitFormModal } from "@/components/HabitFormModal";
import { createHabit, deleteHabit, getHabits, updateHabit } from "@/lib/api";

export default function TodayScreen() {
  const { theme, toggleAt } = useTheme();
  const { user, signOut } = useAuth();
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
    } catch (error) {
      setApiError("Não foi possível salvar este hábito.");
      throw error;
    }
  };

  const completedCount = useMemo(
    () => habits.filter((h) => h.completedToday).length,
    [habits],
  );
  const percentage = habits.length === 0 ? 0 : completedCount / habits.length;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full border border-aurora-500/10" />
      <View className="px-5 pb-4 pt-6 flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center mb-2">
            <View className="mr-2 h-1.5 w-1.5 rounded-full bg-aurora-500" />
            <Text className="font-mono text-[10px] tracking-[1.5px] text-aurora-500">ARRISE / DAILY_01</Text>
          </View>
          <Text className="text-text-dim font-body text-sm">Bom dia, {user?.name ?? "aí"}</Text>
          <Text className="text-text font-display text-[32px] leading-9">Seu ritmo hoje</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable onPress={(e) => toggleAt(e.nativeEvent.pageX, e.nativeEvent.pageY)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Alternar tema" className="h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-bg-elevated/70">
            <Ionicons name={theme === "dark" ? "moon-outline" : "sunny-outline"} size={18} color={theme === "dark" ? "#F4F4EF" : "#676761"} />
          </Pressable>
          <Pressable onPress={() => void signOut()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Sair da conta" className="h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-bg-elevated/70">
            <Ionicons name="log-out-outline" size={18} color="#FF4FD8" />
          </Pressable>
        </View>
      </View>

      <View className="mx-5 mb-5 mt-2 flex-row items-center justify-between rounded-glass border border-aurora-500/20 bg-white/[0.06] px-5 py-5">
        <View>
          <View className="mb-2 flex-row items-center"><View className="mr-2 h-1.5 w-1.5 bg-signal-500" /><Text className="font-mono text-[10px] tracking-[1.5px] text-text-dim">SYS.STATUS // ONLINE</Text></View>
          <Text className="text-text font-display text-2xl mt-2">Em movimento</Text>
          <Text className="mt-1 font-body text-xs text-text-dim">Pequenos sinais, todos os dias.</Text>
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
        <Text className="font-body-semibold text-sm text-text">$ próximos sinais</Text>
        <Pressable onPress={openCreateForm} className="flex-row items-center" accessibilityRole="button" accessibilityLabel="Adicionar hábito">
          <Ionicons name="add" size={16} color="#F4F4EF" />
          <Text className="ml-1 font-body-medium text-xs text-aurora-500">novo --init</Text>
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
              <Pressable onPress={loadHabits} className="mt-4 rounded-xl border border-white/20 px-4 py-2">
                <Text className="font-body-medium text-xs text-aurora-500">retry --sync</Text>
              </Pressable>
            )}
          </View>
        }
      />

      <Pressable
        onPress={openCreateForm}
        className="absolute bottom-24 right-5 h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-aurora-500 shadow-lg"
        accessibilityRole="button"
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
