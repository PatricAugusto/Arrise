# Arrise

Aplicativo de acompanhamento de hábitos com autenticação, registro diário,
calendário de conclusões e indicadores de progresso. O projeto é dividido em
um frontend Expo/React Native e uma API Node.js com SQLite.

## Visão geral

```text
frontend (Expo / React Native / TypeScript)
    | HTTP + Bearer token
backend (Node.js / better-sqlite3, porta 3000)
    |
backend/data/arrise.sqlite
```

O frontend adota uma experiência offline-first: o `AsyncStorage` fornece a
resposta imediata e a API persiste os dados quando disponível. O backend é a
fonte persistente por usuário, com histórico em `habit_completions`.

## Pré-requisitos

- Node.js 18 ou superior
- npm
- Android Studio para Android, ou Xcode em macOS para iOS
- Expo Go para testar em dispositivo físico

## Instalação rápida

Em dois terminais, a partir da raiz do repositório:

Terminal 1, API:

```bash
cd backend
npm install
npm run dev
```

Terminal 2, app:

```bash
cd frontend
npm install
copy .env.example .env
npm run start:lan
```

No PowerShell, o comando de cópia também pode ser executado como:

```powershell
Copy-Item .env.example .env
```

Para web, use `npm run web`. Consulte [frontend/README.md](frontend/README.md)
para hosts por plataforma e [backend/README.md](backend/README.md) para a
especificação da API.

## Configuração da conexão

Defina `EXPO_PUBLIC_API_URL` em `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Em Android Emulator, use `http://10.0.2.2:3000/api`; em telefone físico, use o
IP local do computador. O backend escuta em todas as interfaces, mas o firewall
precisa permitir conexões locais na porta `3000`.

## Funcionalidades

- Cadastro, login, restauração local de sessão e logout.
- Criação, edição, conclusão e exclusão de hábitos.
- Reordenação dos hábitos.
- Streak, progresso dos últimos sete dias e calendário mensal.
- Tema claro, escuro ou automático, persistido localmente.
- Cache local para uso sem conexão durante a navegação.

## Contrato de dados

Um hábito possui `id`, `title`, `icon`, `color`, `streak`, `completedToday` e
`weekProgress`. As cores aceitas são `violet`, `aurora` e `ember`; títulos têm
entre 1 e 48 caracteres; `weekProgress` varia de `0` a `1`.

As rotas de autenticação e hábitos estão documentadas no README do backend.
Todas as rotas de hábitos exigem `Authorization: Bearer <token>`.

## Estrutura do repositório

```text
backend/     API, banco local e dados legados de migração
frontend/    App Expo, telas, componentes e cliente da API
```

Os bancos SQLite gerados e arquivos de ambiente locais não devem ser
versionados. O banco é criado automaticamente na primeira execução da API.

## Limitações atuais

- A recuperação de senha ainda não envia e-mail nem altera a senha.
- A sincronização offline é fire-and-forget; não há fila/reconciliação após
  falhas ou reinicialização.
- O backend usa HTTP, CORS aberto e porta fixa para facilitar o desenvolvimento
  local. Antes de produção, configure HTTPS, origem permitida, segredos e
  gerenciamento de sessões adequado.

## Verificação

```bash
curl http://localhost:3000/api/health
cd frontend
npx tsc --noEmit
```