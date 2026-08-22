import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/lib/auth';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) return setError('Preencha os dados. A senha precisa ter 8 caracteres.');
    setIsSubmitting(true); setError('');
    try { await signUp(name, email, password); router.replace('/(tabs)'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível criar a conta.'); }
    finally { setIsSubmitting(false); }
  };
  return <SafeAreaView className="flex-1 bg-bg px-6"><View className="flex-1 justify-center"><View className="mb-9"><Text className="mb-3 font-mono text-[10px] tracking-[2px] text-aurora-500">ARRISE://REGISTER</Text><Text className="font-display text-4xl leading-tight text-text">Crie seu espaço</Text><Text className="mt-3 font-body text-base text-text-dim">Sua rotina, seus sinais, sua conta.</Text></View>
    <Field label="NOME" value={name} onChangeText={setName} placeholder="Como podemos chamar você?" />
    <Field label="E-MAIL" value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
    <Field label="SENHA" value={password} onChangeText={setPassword} placeholder="Mínimo de 8 caracteres" secureTextEntry />
    {!!error && <Text accessibilityRole="alert" className="mb-4 font-body text-sm text-ember-500">{error}</Text>}
    <Pressable onPress={submit} disabled={isSubmitting} className="items-center rounded-2xl bg-aurora-500 py-4"><Text className="font-body-semibold text-sm text-bg">{isSubmitting ? 'Criando...' : 'Criar conta'}</Text></Pressable>
    <Text className="mt-7 text-center font-body text-sm text-text-dim">Já possui uma conta?</Text><Link href={"/(auth)/login" as any} asChild><Pressable className="mt-2"><Text className="text-center font-body-semibold text-sm text-aurora-500">Entrar</Text></Pressable></Link>
  </View></SafeAreaView>;
}
function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) { return <View className="mb-4"><Text className="mb-2 font-mono text-[10px] tracking-[1.5px] text-text-dim">{label}</Text><TextInput {...props} accessibilityLabel={label} placeholderTextColor="#8793A1" className="rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-4 font-body text-base text-text" /></View>; }
