# Arrise API

## Executar

Na raiz do app:

```bash
npm run backend:dev
```

A API inicia em `http://localhost:3000`.

O backend usa exclusivamente a porta `3000`. Se ela já estiver ocupada, encerre a instância anterior antes de iniciar novamente.

## Rotas

- `GET /api/health`
- `GET /api/habits`
- `POST /api/habits`
- `PATCH /api/habits/:id`
- `DELETE /api/habits/:id`

Os dados ficam em `backend/data/habits.json`. A URL consumida pelo Expo pode ser configurada em `.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Para Android Emulator, use `http://10.0.2.2:3000/api`. Em um dispositivo físico, use o IP local da máquina que executa a API.