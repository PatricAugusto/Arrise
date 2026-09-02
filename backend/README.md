# Arrise Backend

API HTTP local do Arrise. O servidor usa apenas módulos nativos do Node.js e
`better-sqlite3`; não há framework web intermediário.

## Requisitos

- Node.js 18 ou superior
- npm
- Porta `3000` disponível

## Instalação e execução

```bash
cd backend
npm install
npm start
```

Para desenvolvimento, reiniciando automaticamente ao alterar `server.js`:

```bash
npm run dev
```

O servidor escuta em `0.0.0.0:3000`. Verifique a disponibilidade com:

```bash
curl http://localhost:3000/api/health
```

Resposta esperada: `{ "status": "ok" }`.

## Persistência

O banco é criado em `backend/data/arrise.sqlite` e usa SQLite em modo WAL,
chaves estrangeiras, constraints e índice por usuário. Os arquivos `*.sqlite*`
são ignorados pelo Git.

Na primeira inicialização, se as tabelas estiverem vazias, os dados legados de
`backend/data/users.json` e `backend/data/habits.json` são migrados. O arquivo
de hábitos sem `userId` é associado ao primeiro usuário encontrado.

Tabelas principais:

- `users`: conta, hash de senha e token de sessão atual.
- `habits`: hábitos e métricas derivadas.
- `habit_completions`: uma conclusão por hábito e data (`YYYY-MM-DD`).

As métricas `streak`, `completedToday` e `weekProgress` são recalculadas ao
carregar os hábitos. A semana considera os sete dias incluindo hoje.

## Autenticação

Cadastro e login retornam um token aleatório de sessão. Nas rotas protegidas,
envie-o como `Authorization: Bearer <token>`. Cada novo login substitui o
token anterior do usuário.

### `POST /api/auth/register`

Body: `{ "name": "Ana", "email": "ana@example.com", "password": "minha-senha" }`

Senha com pelo menos 8 caracteres. Retorna `201` com `{ token, user }`; e-mail
duplicado retorna `409`.

### `POST /api/auth/login`

Body: `{ "email": "ana@example.com", "password": "minha-senha" }`.

Retorna `200` com `{ token, user }`; credenciais inválidas retornam `401`.

### `POST /api/auth/forgot-password`

Body: `{ "email": "ana@example.com" }`. Retorna `200` com uma mensagem neutra.
No estado atual, não há envio de e-mail nem redefinição efetiva de senha.

## Rotas protegidas de hábitos

Todas exigem o header de autenticação.

| Método e rota | Body | Retorno |
| --- | --- | --- |
| `GET /api/habits` | nenhum | `200`: lista de hábitos do usuário |
| `POST /api/habits` | `title`, `icon`, `color` | `201`: hábito criado |
| `PATCH /api/habits/:id` | qualquer combinação dos campos aceitos | `200`: hábito atualizado |
| `DELETE /api/habits/:id` | nenhum | `204` |
| `GET /api/habits/calendar?month=YYYY-MM` | nenhum | `200`: `{ month, completions }` |
| `POST /api/habits/reorder` | `{ "ids": ["id-1", "id-2"] }` | `200`: lista reordenada |

Campos aceitos para criação/atualização:

- `title`: string de 1 a 48 caracteres.
- `icon`: string com o nome do ícone Ionicons.
- `color`: `violet`, `aurora` ou `ember`.
- `completedToday`: booleano; no `PATCH`, cria ou remove a conclusão de hoje.

Erros usam `{ "error": "mensagem" }`. Códigos comuns: `400` entrada inválida,
`401` sem sessão válida, `404` recurso/rota inexistente, `405` método não aceito.

## Segurança e operação

- Senhas são armazenadas com `scrypt` e salt aleatório.
- Comparações de senha usam comparação resistente a timing.
- O corpo das requisições é limitado a 16 KiB.
- CORS está aberto para facilitar o uso local pelo Expo.
- Não há logout no backend: o app remove o token localmente; um novo login
	invalida a sessão anterior.

Para alterar a porta ou habilitar configuração por ambiente, o valor `PORT` em
`server.js` precisa ser ajustado; atualmente a porta é fixa em `3000`.