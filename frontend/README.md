# Arrise Frontend

Aplicativo mobile e web do Arrise, construído com Expo, React Native, Expo
Router, TypeScript, NativeWind e Tamagui.

## Requisitos

- Node.js 18 ou superior
- npm
- Expo CLI via `npx`
- Para dispositivo físico: Expo Go e computador/dispositivo na mesma rede
- Para Android nativo: Android Studio/emulador configurado
- Para iOS nativo: macOS e Xcode

## Instalação e execução

```bash
cd frontend
npm install
npm start
```

Comandos disponíveis:

```bash
npm run start:lan  # Expo usando a rede local
npm run android    # Abre no Android
npm run ios        # Abre no iOS
npm run web        # Abre a versão web
npm run backend    # Inicia o backend uma vez
npm run backend:dev
```

O backend deve estar rodando separadamente na porta `3000`. Para Expo Go,
escaneie o QR code da execução atual. O modo LAN é normalmente o mais simples
para um telefone físico.

## Configuração da API

Copie `.env.example` para `.env` e ajuste a URL:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Use os seguintes hosts conforme o ambiente:

| Ambiente | URL |
| --- | --- |
| Web ou iOS Simulator | `http://localhost:3000/api` |
| Android Emulator | `http://10.0.2.2:3000/api` |
| Dispositivo físico | `http://IP-DA-MAQUINA:3000/api` |

O endereço também possui um fallback automático baseado no host do Expo. O
valor `extra.apiUrl` em `app.json` existe como fallback de configuração; prefira
`.env` para desenvolvimento. Após alterar variáveis, reinicie o bundler.

## Fluxo da aplicação

O layout raiz carrega fontes, tema e autenticação antes de exibir a navegação.
Usuários sem sessão veem o grupo `(auth)`; usuários autenticados veem as abas:

- **Hoje**: acompanhamento dos hábitos do dia.
- **Progresso**: visão de progresso.
- **Calendário**: histórico de conclusões.
- **Evolução**: métricas e tendências.

As telas de autenticação incluem login, cadastro e solicitação de recuperação de
senha. A recuperação atualmente depende apenas da resposta simulada da API.

## Arquitetura local e sincronização

`lib/api.ts` centraliza as requisições HTTP, o token e o cache. O app usa estas
chaves do `AsyncStorage`:

- `@arrise/auth-token` e `@arrise/auth-user`: sessão restaurada localmente.
- `@arrise/local-habits`: hábitos exibidos imediatamente.
- `@arrise/local-completions`: conclusões usadas pelo calendário.
- `@arrise/theme-mode`: preferência `dark`, `light` ou `system`.

Leitura de hábitos e calendário prioriza o cache. Criação, edição, conclusão,
exclusão e ordenação atualizam o cache primeiro e enviam a alteração em segundo
plano; falhas de rede não bloqueiam a interface. Login e cadastro exigem API.

Atualmente não existe uma fila de sincronização com reconciliação: alterações
offline pendentes podem não ser reenviadas após reinício, e hábitos locais com
ID `local-` não são enviados em operações de edição, exclusão ou reordenação.

## Estrutura

```text
app/                 Rotas Expo Router e telas
components/          Componentes reutilizáveis da interface
lib/api.ts            Cliente HTTP e cache offline
lib/auth.tsx          Contexto de autenticação
lib/theme.tsx         Tema persistido e transição visual
lib/types.ts          Tipos compartilhados do frontend
global.css            Tokens NativeWind
tamagui.config.ts     Configuração Tamagui
```

Os aliases TypeScript usam `@/*` apontando para a raiz de `frontend`. A
interface usa fontes Space Grotesk, Inter e Space Mono carregadas no layout raiz.

## Desenvolvimento

```bash
npx tsc --noEmit
npx expo start --clear
```

Ao alterar o endereço da API ou dependências nativas, reinicie o bundler e, se
necessário, limpe o cache. A configuração Android permite HTTP sem TLS para o
backend local; em produção, use HTTPS e uma política de rede apropriada.