const http = require('node:http');
const { randomUUID, randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const { mkdir, readFile, rename, writeFile } = require('node:fs/promises');
const path = require('node:path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'habits.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const ALLOWED_COLORS = new Set(['violet', 'aurora', 'ember']);
const MAX_BODY_SIZE = 1024 * 16;

async function ensureDataFile() {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await readFile(DATA_FILE, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeFile(DATA_FILE, '[]', 'utf8');
  }
  try {
    await readFile(USERS_FILE, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeFile(USERS_FILE, '[]', 'utf8');
  }
}

async function readHabits() {
  const content = await readFile(DATA_FILE, 'utf8');
  return JSON.parse(content);
}

async function writeHabits(habits) {
  const temporaryFile = `${DATA_FILE}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(habits, null, 2), 'utf8');
  await rename(temporaryFile, DATA_FILE);
}

async function readUsers() {
  return JSON.parse(await readFile(USERS_FILE, 'utf8'));
}

async function writeUsers(users) {
  const temporaryFile = `${USERS_FILE}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(users, null, 2), 'utf8');
  await rename(temporaryFile, USERS_FILE);
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function passwordMatches(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(derived, Buffer.from(hash, 'hex'));
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function getAuthUser(request, users) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  return users.find((user) => user.sessionToken === token) || null;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  response.end(payload === undefined ? '' : JSON.stringify(payload));
}

function sendError(response, status, message) {
  sendJson(response, status, { error: message });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY_SIZE) {
        reject(new Error('Payload too large'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

function validateHabitInput(input, partial = false) {
  const allowedKeys = new Set(['title', 'icon', 'color', 'completedToday']);
  if (!input || typeof input !== 'object') return 'Body must be an object';
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) return 'Body contains an unsupported field';
  if (!partial && (!input.title || !input.icon || !input.color)) return 'title, icon and color are required';
  if (input.title !== undefined && (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 48)) return 'title must contain 1 to 48 characters';
  if (input.icon !== undefined && typeof input.icon !== 'string') return 'icon must be a string';
  if (input.color !== undefined && !ALLOWED_COLORS.has(input.color)) return 'color is invalid';
  if (input.completedToday !== undefined && typeof input.completedToday !== 'boolean') return 'completedToday must be boolean';
  return null;
}

async function handleRequest(request, response) {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204);
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  const segments = url.pathname.split('/').filter(Boolean);

  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  const users = await readUsers();
  if (request.method === 'POST' && url.pathname === '/api/auth/register') {
    const input = await readBody(request);
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    if (!name || !email || password.length < 8) {
      sendError(response, 400, 'Nome, e-mail e senha com no mínimo 8 caracteres são obrigatórios.');
      return;
    }
    if (users.some((user) => user.email === email)) {
      sendError(response, 409, 'Já existe uma conta com este e-mail.');
      return;
    }
    const user = { id: randomUUID(), name, email, passwordHash: hashPassword(password), sessionToken: randomBytes(32).toString('hex') };
    users.push(user);
    await writeUsers(users);
    sendJson(response, 201, { token: user.sessionToken, user: publicUser(user) });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const input = await readBody(request);
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    const user = users.find((item) => item.email === email);
    if (!user || !passwordMatches(password, user.passwordHash)) {
      sendError(response, 401, 'E-mail ou senha inválidos.');
      return;
    }
    user.sessionToken = randomBytes(32).toString('hex');
    await writeUsers(users);
    sendJson(response, 200, { token: user.sessionToken, user: publicUser(user) });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/forgot-password') {
    const input = await readBody(request);
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    if (!email) {
      sendError(response, 400, 'Informe um e-mail válido.');
      return;
    }
    sendJson(response, 200, { message: 'Se houver uma conta, enviaremos instruções para este e-mail.' });
    return;
  }

  const currentUser = getAuthUser(request, users);
  if (!currentUser) {
    sendError(response, 401, 'Faça login para continuar.');
    return;
  }

  if (segments[0] !== 'api' || segments[1] !== 'habits' || segments.length > 3) {
    sendError(response, 404, 'Route not found');
    return;
  }

  const habitId = segments[2];
  const allHabits = await readHabits();
  const habits = allHabits.filter((habit) => habit.userId === currentUser.id);

  if (request.method === 'GET' && segments.length === 2) {
    sendJson(response, 200, habits);
    return;
  }

  if (request.method === 'POST' && segments.length === 2) {
    const input = await readBody(request);
    const validationError = validateHabitInput(input);
    if (validationError) {
      sendError(response, 400, validationError);
      return;
    }

    const habit = {
      id: randomUUID(),
      userId: currentUser.id,
      title: input.title.trim(),
      icon: input.icon,
      color: input.color,
      streak: 0,
      completedToday: false,
      weekProgress: 0,
    };
    habits.push(habit);
    await writeHabits([...allHabits, habit]);
    sendJson(response, 201, habit);
    return;
  }

  const habitIndex = habits.findIndex((habit) => habit.id === habitId);
  if (habitIndex === -1) {
    sendError(response, 404, 'Habit not found');
    return;
  }

  if (request.method === 'PATCH' && segments.length === 3) {
    const input = await readBody(request);
    const validationError = validateHabitInput(input, true);
    if (validationError) {
      sendError(response, 400, validationError);
      return;
    }

    const currentHabit = habits[habitIndex];
    habits[habitIndex] = {
      ...currentHabit,
      ...input,
      title: input.title === undefined ? currentHabit.title : input.title.trim(),
    };
    await writeHabits(allHabits.map((habit) => habit.id === habitId ? habits[habitIndex] : habit));
    sendJson(response, 200, habits[habitIndex]);
    return;
  }

  if (request.method === 'DELETE' && segments.length === 3) {
    await writeHabits(allHabits.filter((habit) => habit.id !== habitId));
    sendJson(response, 204);
    return;
  }

  sendError(response, 405, 'Method not allowed');
}

ensureDataFile()
  .then(() => {
    const server = http.createServer((request, response) => {
      handleRequest(request, response).catch((error) => {
        console.error(error);
        if (!response.headersSent) sendError(response, 500, 'Internal server error');
      });
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`A porta ${PORT} já está em uso.`);
        console.error(`A API pode já estar rodando em http://localhost:${PORT}.`);
        console.error('Encerre a instância anterior antes de iniciar o backend novamente.');
        process.exit(0);
        return;
      }
      throw error;
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Arrise API running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Could not initialize data storage', error);
    process.exit(1);
  });
