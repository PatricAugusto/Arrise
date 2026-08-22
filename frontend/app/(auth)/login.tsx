import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return setError('Preencha e-mail e senha.');
    setIsSubmitting(true); setError('');
    try { await signIn(email, password); router.replace('/(tabs)'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível entrar.'); }
    finally { setIsSubmitting(false); }
  };

  return <AuthShell eyebrow="ARRISE://ACCESS" title="Volte ao seu ritmo" subtitle="Entre para continuar sua sequência.">
    <Field label="E-MAIL" value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
    <Field label="SENHA" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
    <Link href={"/(auth)/forgot-password" as any} asChild><Pressable className="mb-6 self-end"><Text className="font-body-medium text-sm text-aurora-500">Esqueci minha senha</Text></Pressable></Link>
    {!!error && <Text accessibilityRole="alert" className="mb-4 font-body text-sm text-ember-500">{error}</Text>}
    <Pressable onPress={submit} disabled={isSubmitting} className="items-center rounded-2xl bg-aurora-500 py-4" accessibilityRole="button">
      <Text className="font-body-semibold text-sm text-bg">{isSubmitting ? 'Entrando...' : 'Entrar'}</Text>
    </Pressable>
    <Text className="mt-7 text-center font-body text-sm text-text-dim">Ainda não tem conta?</Text>
    <Link href={"/(auth)/register" as any} asChild><Pressable className="mt-2"><Text className="text-center font-body-semibold text-sm text-aurora-500">Criar uma conta</Text></Pressable></Link>
  </AuthShell>;
}

function AuthShell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <SafeAreaView className="flex-1 bg-bg px-6"><View className="absolute -right-24 top-12 h-64 w-64 rounded-full border border-aurora-500/10" />
    <View className="flex-1 justify-center"><View className="mb-10"><View className="mb-3 flex-row items-center"><View className="mr-2 h-2 w-2 rounded-full bg-aurora-500" /><Text className="font-mono text-[10px] tracking-[2px] text-aurora-500">{eyebrow}</Text></View><Text className="font-display text-4xl leading-tight text-text">{title}</Text><Text className="mt-3 font-body text-base text-text-dim">{subtitle}</Text></View><View>{children}</View></View>
  </SafeAreaView>;
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return <View className="mb-4"><Text className="mb-2 font-mono text-[10px] tracking-[1.5px] text-text-dim">{label}</Text><TextInput {...props} accessibilityLabel={label} placeholderTextColor="#8793A1" className="rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-4 font-body text-base text-text" /></View>;
}
