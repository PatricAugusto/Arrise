import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitColor } from '@/lib/types';

interface HabitFormModalProps {
  visible: boolean;
  habit?: Habit | null;
  onClose: () => void;
  onSave: (data: Pick<Habit, 'title' | 'icon' | 'color'>) => void;
}

const COLORS: Array<{ value: HabitColor; label: string; hex: string }> = [
  { value: 'aurora', label: 'Aurora', hex: '#3CEFD8' },
  { value: 'violet', label: 'Metal', hex: '#A8B8BB' },
  { value: 'ember', label: 'Ember', hex: '#FFA37D' },
];

const ICONS = ['sparkles-outline', 'water-outline', 'book-outline', 'barbell-outline', 'leaf-outline', 'moon-outline'];

export function HabitFormModal({ visible, habit, onClose, onSave }: HabitFormModalProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState<HabitColor>('aurora');
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (!visible) return;
    setTitle(habit?.title ?? '');
    setColor(habit?.color ?? 'aurora');
    setIcon(habit?.icon ?? ICONS[0]);
  }, [visible, habit]);

  const handleSave = () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return;
    onSave({ title: normalizedTitle, icon, color });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1 justify-end bg-black/60" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="rounded-t-[28px] border-t border-aurora-500/20 bg-bg-elevated px-5 pb-8 pt-4">
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <Text className="font-mono text-[10px] tracking-[2px] text-aurora-500">ARRISE / CONFIG</Text>
              <Text className="mt-1 font-display text-2xl text-text">{habit ? 'Editar hábito' : 'Novo hábito'}</Text>
            </View>
            <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full border border-glass-border/10" accessibilityLabel="Fechar">
              <Ionicons name="close" size={20} color="#8B9EA3" />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text className="mb-2 font-mono text-[10px] tracking-[1.5px] text-text-dim">NOME DO HÁBITO</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: Caminhar 20 minutos"
              placeholderTextColor="#65787D"
              maxLength={48}
              autoFocus={!habit}
              className="mb-5 rounded-2xl border border-glass-border/10 bg-bg px-4 py-4 font-body text-base text-text"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />

            <Text className="mb-2 font-mono text-[10px] tracking-[1.5px] text-text-dim">ÍCONE</Text>
            <View className="mb-5 flex-row flex-wrap gap-2">
              {ICONS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setIcon(item)}
                  className={`h-11 w-11 items-center justify-center rounded-xl border ${icon === item ? 'border-aurora-500 bg-aurora-500/10' : 'border-glass-border/10 bg-bg'}`}
                  accessibilityLabel={`Selecionar ícone ${item}`}
                >
                  <Ionicons name={item as any} size={19} color={icon === item ? '#3CEFD8' : '#8B9EA3'} />
                </Pressable>
              ))}
            </View>

            <Text className="mb-2 font-mono text-[10px] tracking-[1.5px] text-text-dim">COR DE SINAL</Text>
            <View className="mb-6 flex-row gap-2">
              {COLORS.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setColor(item.value)}
                  className={`flex-1 flex-row items-center justify-center rounded-xl border py-3 ${color === item.value ? 'border-aurora-500/60 bg-aurora-500/10' : 'border-glass-border/10 bg-bg'}`}
                >
                  <View style={{ backgroundColor: item.hex }} className="mr-2 h-2 w-2 rounded-full" />
                  <Text className="font-body-medium text-xs text-text">{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleSave}
              disabled={!title.trim()}
              className={`items-center rounded-2xl py-4 ${title.trim() ? 'bg-aurora-500' : 'bg-text-dim/20'}`}
            >
              <Text className={`font-body-semibold text-sm ${title.trim() ? 'text-bg' : 'text-text-dim'}`}>
                {habit ? 'Salvar alterações' : 'Adicionar hábito'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
