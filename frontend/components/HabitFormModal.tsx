import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitColor } from '@/lib/types';
import { useTheme } from '@/lib/theme';

interface HabitFormModalProps {
  visible: boolean;
  habit?: Habit | null;
  onClose: () => void;
  onSave: (data: Pick<Habit, 'title' | 'icon' | 'color'>) => void | Promise<void>;
  onDelete: (habit: Habit) => void;
}

const COLORS: Array<{ value: HabitColor; label: string; hex: string }> = [
  { value: 'aurora', label: 'White', hex: '#F4F4EF' },
  { value: 'violet', label: 'Silver', hex: '#A7A7A0' },
  { value: 'ember', label: 'Graphite', hex: '#8C8C84' },
];

const ICONS = ['sparkles-outline', 'water-outline', 'book-outline', 'barbell-outline', 'leaf-outline', 'moon-outline'];

export function HabitFormModal({ visible, habit, onClose, onSave, onDelete }: HabitFormModalProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState<HabitColor>('aurora');
  const [icon, setIcon] = useState(ICONS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { theme } = useTheme();
  const mutedIconColor = theme === 'dark' ? '#8793A1' : '#52606D';
  const selectedIconColor = theme === 'dark' ? '#F4F4EF' : '#087F8C';

  useEffect(() => {
    if (!visible) return;
    setTitle(habit?.title ?? '');
    setColor(habit?.color ?? 'aurora');
    setIcon(habit?.icon ?? ICONS[0]);
    setSaveError(null);
  }, [visible, habit]);

  const handleSave = async () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave({ title: normalizedTitle, icon, color });
    } catch {
      setSaveError('Não foi possível salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!habit) return;
    Alert.alert('Excluir hábito?', `"${habit.title}" será removido da sua rotina.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => onDelete(habit),
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1 justify-end bg-black/60" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="rounded-t-2xl border-t-2 border-aurora-500/40 bg-bg-elevated px-5 pb-8 pt-4">
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <Text className="font-mono text-[10px] tracking-[1.5px] text-aurora-600">ARRISE / CONFIG_03</Text>
              <Text className="mt-1 font-display text-2xl text-text">{habit ? 'Editar hábito' : 'Novo hábito'}</Text>
            </View>
            <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full border border-glass-border/10" accessibilityRole="button" accessibilityLabel="Fechar">
              <Ionicons name="close" size={20} color={mutedIconColor} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text className="mb-2 font-mono text-[10px] tracking-[1.5px] text-text-dim">NOME DO HÁBITO</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: Caminhar 20 minutos"
              placeholderTextColor="#52606D"
              maxLength={48}
              autoFocus={!habit}
              className="mb-5 rounded-xl border border-glass-border/20 bg-bg px-4 py-4 font-body text-base text-text"
              returnKeyType="done"
              onSubmitEditing={handleSave}
              accessibilityLabel="Nome do hábito"
            />

            <Text className="mb-2 font-mono text-[10px] tracking-[1.5px] text-text-dim">ÍCONE</Text>
            <View className="mb-5 flex-row flex-wrap gap-2">
              {ICONS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setIcon(item)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: icon === item }}
                  className={`h-11 w-11 items-center justify-center rounded-xl border ${icon === item ? 'border-aurora-500 bg-aurora-500/10' : 'border-glass-border/10 bg-bg'}`}
                  accessibilityLabel={`Selecionar ícone ${item}`}
                >
                  <Ionicons name={item as any} size={19} color={icon === item ? selectedIconColor : mutedIconColor} />
                </Pressable>
              ))}
            </View>

            <Text className="mb-2 font-mono text-[10px] tracking-[1.5px] text-text-dim">COR DE SINAL</Text>
            <View className="mb-6 flex-row gap-2">
              {COLORS.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setColor(item.value)}
                  accessibilityRole="radio"
                  accessibilityLabel={`Cor ${item.label}`}
                  accessibilityState={{ selected: color === item.value }}
                  className={`flex-1 flex-row items-center justify-center rounded-xl border py-3 ${color === item.value ? 'border-aurora-500/60 bg-aurora-500/10' : 'border-glass-border/10 bg-bg'}`}
                >
                  <View style={{ backgroundColor: item.hex }} className="mr-2 h-2 w-2 rounded-full" />
                  <Text className="font-body-medium text-xs text-text">{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleSave}
              disabled={!title.trim() || isSaving}
              accessibilityRole="button"
              accessibilityState={{ disabled: !title.trim() || isSaving, busy: isSaving }}
              className={`items-center rounded-2xl py-4 ${title.trim() && !isSaving ? 'bg-aurora-500' : 'bg-text-dim/20'}`}
            >
              <Text className={`font-body-semibold text-sm ${title.trim() && !isSaving ? 'text-bg' : 'text-text-dim'}`}>
                {isSaving ? 'Salvando...' : habit ? 'Salvar alterações' : 'Adicionar hábito'}
              </Text>
            </Pressable>

            {!!saveError && <Text accessibilityRole="alert" className="mt-3 text-center font-body text-sm text-ember-500">{saveError}</Text>}

            {habit && (
              <Pressable onPress={handleDelete} className="mt-3 flex-row items-center justify-center py-3" accessibilityLabel="Excluir hábito">
                <Ionicons name="trash-outline" size={16} color={mutedIconColor} />
                <Text className="ml-2 font-body-medium text-xs text-ember-500">Excluir hábito</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
