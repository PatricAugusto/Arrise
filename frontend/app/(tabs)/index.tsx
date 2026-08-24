import { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useFocusEffect } from "expo-router";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Habit } from "@/lib/types";
import { HabitCard } from "@/components/HabitCard";
import { ProgressRing } from "@/components/ProgressRing";
import { HabitFormModal } from "@/components/HabitFormModal";
import { CyberPulse } from "@/components/CyberPulse";
import { BinaryCodeAnimation } from "@/components/BinaryCodeAnimation";
import { createHabit, deleteHabit, getHabits, reorderHabits, updateHabit } from "@/lib/api";

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

  useFocusEffect(
    useCallback(() => {
      void loadHabits();
    }, [loadHabits]),
  );

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

  const handleDragEnd = async ({ data }: { data: Habit[] }) => {
    setHabits(data);
    try {
      const savedHabits = await reorderHabits(data.map((habit) => habit.id));
      setHabits(savedHabits);
    } catch {
      setApiError("Não foi possível salvar a ordem dos hábitos.");
      void loadHabits();
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
      <View className="flex-1">
        <View pointerEvents="none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, elevation: 0 }}>
          <BinaryCodeAnimation />
        </View>
        <View className="flex-1" style={{ zIndex: 1, elevation: 1 }}>
        <View className="px-5 pb-4 pt-6 flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center mb-2">
              <View className="mr-2"><CyberPulse color="#00E5FF" size={6} /></View>
              <Text className="font-mono text-[10px] tracking-[1.5px] text-aurora-600">ARRISE / DAILY_01</Text>
            </View>
            <Text className="text-text-dim font-body text-sm">Bom dia, {user?.name ?? "aí"}</Text>
            <Text className="text-text font-display text-[32px] leading-9">Seu ritmo hoje</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable onPress={(e) => toggleAt(e.nativeEvent.pageX, e.nativeEvent.pageY)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Alternar tema" className="h-10 w-10 items-center justify-center rounded-lg border border-glass-border/15 bg-bg-elevated">
              <Ionicons name={theme === "dark" ? "moon-outline" : "sunny-outline"} size={18} color={theme === "dark" ? "#F4F4EF" : "#676761"} />
            </Pressable>
            <Pressable onPress={() => void signOut()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Sair da conta" className="h-10 w-10 items-center justify-center rounded-lg border border-glass-border/15 bg-bg-elevated">
              <Ionicons name="log-out-outline" size={18} color="#FF4FD8" />
            </Pressable>
          </View>
        </View>

          <DraggableFlatList
        data={habits}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, zIndex: 2, elevation: 2 }}
        containerStyle={{ flex: 1 }}
        activationDistance={12}
        onDragEnd={handleDragEnd}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <View>
            <View className="mb-5 mt-2 flex-row items-center justify-between rounded-glass border border-aurora-500/30 bg-bg-elevated px-5 py-5">
              <View>
                <View className="mb-2 flex-row items-center"><View className="mr-2"><CyberPulse color="#D7FF3F" size={6} /></View><Text className="font-mono text-[10px] tracking-[1.5px] text-text-dim">SYS.STATUS // ONLINE</Text></View>
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
            <View className="relative z-20 mb-2 flex-row items-center justify-between" style={{ zIndex: 20, elevation: 20 }}>
              <Text className="font-body-semibold text-sm text-text">$ próximos sinais</Text>
              <Pressable onPress={openCreateForm} className="flex-row items-center" accessibilityRole="button" accessibilityLabel="Adicionar hábito">
                <Ionicons name="add" size={16} color={theme === "dark" ? "#F4F4EF" : "#12343B"} />
                <Text className="ml-1 font-body-medium text-xs text-aurora-600">novo --init</Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item, drag, isActive }: RenderItemParams<Habit>) => (
          <HabitCard
            habit={item}
            entranceDelay={Math.min(habits.indexOf(item) * 70, 280)}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={openEditForm}
            onDrag={drag}
            isActive={isActive}
          />
        )}
          ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-text-dim font-body text-center">
              {isLoading ? "Sincronizando hábitos..." : apiError ?? "Nenhum hábito por aqui. Adicione um novo sinal."}
            </Text>
            {!!apiError && !isLoading && (
              <Pressable onPress={loadHabits} className="mt-4 rounded-xl border border-glass-border/20 px-4 py-2">
                <Text className="font-body-medium text-xs text-aurora-600">retry --sync</Text>
              </Pressable>
            )}
          </View>
          }
          />
        </View>
      </View>

      <Pressable
        onPress={openCreateForm}
        className="absolute bottom-24 right-5 z-30 h-14 w-14 items-center justify-center rounded-full border border-glass-border/20 bg-aurora-500 shadow-lg"
        style={{ zIndex: 30, elevation: 30 }}
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
