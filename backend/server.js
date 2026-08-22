const http = require('node:http');
const { randomUUID, randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const Database = require('better-sqlite3');
const { mkdir, readFile } = require('node:fs/promises');
const path = require('node:path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'habits.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const DATABASE_FILE = path.join(__dirname, 'data', 'arrise.sqlite');
const ALLOWED_COLORS = new Set(['violet', 'aurora', 'ember']);
const MAX_BODY_SIZE = 1024 * 16;

async function ensureDatabase() {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  const database = new Database(DATABASE_FILE);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      session_token TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 48),
      icon TEXT NOT NULL,
      color TEXT NOT NULL CHECK(color IN ('violet', 'aurora', 'ember')),
      streak INTEGER NOT NULL DEFAULT 0 CHECK(streak >= 0),
      completed_today INTEGER NOT NULL DEFAULT 0 CHECK(completed_today IN (0, 1)),
      week_progress REAL NOT NULL DEFAULT 0 CHECK(week_progress BETWEEN 0 AND 1),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
  `);

  const userCount = database.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (userCount === 0) {
    try {
      const users = JSON.parse(await readFile(USERS_FILE, 'utf8'));
      const insertUser = database.prepare('INSERT OR IGNORE INTO users (id, name, email, password_hash, session_token) VALUES (?, ?, ?, ?, ?)');
      const migrateUsers = database.transaction((items) => items.forEach((user) => insertUser.run(user.id, user.name, user.email, user.passwordHash, user.sessionToken || null)));
      migrateUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  const habitCount = database.prepare('SELECT COUNT(*) AS count FROM habits').get().count;
  if (habitCount === 0) {
    try {
      const habits = JSON.parse(await readFile(DATA_FILE, 'utf8'));
      const firstUser = database.prepare('SELECT id FROM users ORDER BY created_at, id LIMIT 1').get();
      const insertHabit = database.prepare('INSERT OR IGNORE INTO habits (id, user_id, title, icon, color, streak, completed_today, week_progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      const migrateHabits = database.transaction((items) => items.forEach((habit) => {
        const userId = habit.userId || firstUser?.id;
        if (userId) insertHabit.run(habit.id, userId, habit.title, habit.icon, habit.color, habit.streak || 0, habit.completedToday ? 1 : 0, habit.weekProgress || 0);
      }));
      migrateHabits(Array.isArray(habits) ? habits : []);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return database;
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

function getAuthUser(request, database) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  return database.prepare('SELECT id, name, email FROM users WHERE session_token = ?').get(token) || null;
}

function habitFromRow(row) {
  return { id: row.id, title: row.title, icon: row.icon, color: row.color, streak: row.streak, completedToday: Boolean(row.completed_today), weekProgress: row.week_progress };
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

async function handleRequest(request, response, database) {
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

  if (request.method === 'POST' && url.pathname === '/api/auth/register') {
    const input = await readBody(request);
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    if (!name || !email || password.length < 8) {
      sendError(response, 400, 'Nome, e-mail e senha com no mínimo 8 caracteres são obrigatórios.');
      return;
    }
    const user = { id: randomUUID(), name, email, passwordHash: hashPassword(password), sessionToken: randomBytes(32).toString('hex') };
    try {
      database.prepare('INSERT INTO users (id, name, email, password_hash, session_token) VALUES (?, ?, ?, ?, ?)').run(user.id, user.name, user.email, user.passwordHash, user.sessionToken);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return sendError(response, 409, 'Já existe uma conta com este e-mail.');
      throw error;
    }
    sendJson(response, 201, { token: user.sessionToken, user: publicUser(user) });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const input = await readBody(request);
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const password = typeof input.password === 'string' ? input.password : '';
    const user = database.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').get(email);
    if (!user || !passwordMatches(password, user.password_hash)) {
      sendError(response, 401, 'E-mail ou senha inválidos.');
      return;
    }
    const sessionToken = randomBytes(32).toString('hex');
    database.prepare('UPDATE users SET session_token = ? WHERE id = ?').run(sessionToken, user.id);
    sendJson(response, 200, { token: sessionToken, user: publicUser(user) });
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

  const currentUser = getAuthUser(request, database);
  if (!currentUser) {
    sendError(response, 401, 'Faça login para continuar.');
    return;
  }

  if (segments[0] !== 'api' || segments[1] !== 'habits' || segments.length > 3) {
    sendError(response, 404, 'Route not found');
    return;
  }

  const habitId = segments[2];
  const habits = database.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at, rowid').all(currentUser.id).map(habitFromRow);

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
    database.prepare('INSERT INTO habits (id, user_id, title, icon, color, streak, completed_today, week_progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(habit.id, habit.userId, habit.title, habit.icon, habit.color, habit.streak, 0, habit.weekProgress);
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
    const updatedHabit = {
      ...currentHabit,
      ...input,
      title: input.title === undefined ? currentHabit.title : input.title.trim(),
    };
    database.prepare('UPDATE habits SET title = ?, icon = ?, color = ?, completed_today = ? WHERE id = ? AND user_id = ?').run(updatedHabit.title, updatedHabit.icon, updatedHabit.color, updatedHabit.completedToday ? 1 : 0, habitId, currentUser.id);
    sendJson(response, 200, updatedHabit);
    return;
  }

  if (request.method === 'DELETE' && segments.length === 3) {
    database.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(habitId, currentUser.id);
    sendJson(response, 204);
    return;
  }

  sendError(response, 405, 'Method not allowed');
}

ensureDatabase()
  .then((database) => {
    const server = http.createServer((request, response) => {
      handleRequest(request, response, database).catch((error) => {
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
