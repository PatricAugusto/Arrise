import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { forgotPassword } from '@/lib/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async () => {
    if (!email.trim()) return setError('Informe seu e-mail.');
    setIsSubmitting(true); setError(''); setMessage('');
    try { setMessage((await forgotPassword(email)).message); } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível solicitar a recuperação.'); } finally { setIsSubmitting(false); }
  };
  return <SafeAreaView className="flex-1 bg-bg px-6"><View className="flex-1 justify-center"><Text className="mb-3 font-mono text-[10px] tracking-[2px] text-aurora-500">ARRISE://RECOVERY</Text><Text className="font-display text-4xl leading-tight text-text">Recupere o acesso</Text><Text className="mb-9 mt-3 font-body text-base text-text-dim">Enviaremos instruções para o e-mail da sua conta.</Text><Text className="mb-2 font-mono text-[10px] tracking-[1.5px] text-text-dim">E-MAIL</Text><TextInput value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" placeholderTextColor="#8793A1" keyboardType="email-address" autoCapitalize="none" accessibilityLabel="E-mail" className="mb-4 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-4 font-body text-base text-text" />
    {!!error && <Text accessibilityRole="alert" className="mb-4 font-body text-sm text-ember-500">{error}</Text>}{!!message && <Text className="mb-4 font-body text-sm text-aurora-500">{message}</Text>}<Pressable onPress={submit} disabled={isSubmitting} className="items-center rounded-2xl bg-aurora-500 py-4"><Text className="font-body-semibold text-sm text-bg">{isSubmitting ? 'Enviando...' : 'Enviar instruções'}</Text></Pressable><Link href={"/(auth)/login" as any} asChild><Pressable className="mt-7"><Text className="text-center font-body-semibold text-sm text-aurora-500">Voltar para o login</Text></Pressable></Link>
  </View></SafeAreaView>;
}
