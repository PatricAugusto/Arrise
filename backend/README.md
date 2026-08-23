# Arrise API

## Executar

Na raiz do app:

```bash
npm run backend:dev
```

A API inicia em `http://localhost:3000`.

## Executar o app com Expo Go

Em outro terminal, dentro de `frontend`, execute:

```bash
npm start
```

Para garantir que o QR code use o IP da rede local, execute:

```bash
npm run start:lan
```

O telefone e o computador precisam estar na mesma rede Wi-Fi. Escaneie sempre o QR code gerado pela execução atual; QR codes antigos de outra porta ou do modo tunnel deixam de funcionar quando o packager é encerrado.

O backend usa exclusivamente a porta `3000`. Se ela já estiver ocupada, encerre a instância anterior antes de iniciar novamente.

## Rotas

- `GET /api/health`
- `GET /api/habits`
- `POST /api/habits`
- `PATCH /api/habits/:id`
- `DELETE /api/habits/:id`

Os dados são persistidos em SQLite em `backend/data/arrise.sqlite`. Na primeira execução, os arquivos legados `backend/data/users.json` e `backend/data/habits.json` são migrados automaticamente. O banco usa transações, chaves estrangeiras, constraints e índice por usuário.

A URL consumida pelo Expo pode ser configurada em `.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Para Android Emulator, use `http://10.0.2.2:3000/api`. Em um dispositivo físico, use o IP local da máquina que executa a API.