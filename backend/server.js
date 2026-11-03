require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Interface, JsonRpcProvider, getAddress, isAddress, isHexString } = require('ethers');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'local-development-secret-change-me');
const REGISTRATION_ABI = [
  'event RegistrationRecorded(address indexed account, bytes32 indexed registrationHash, uint256 timestamp)',
];
const registrationInterface = new Interface(REGISTRATION_ABI);
const sampleData = {
  lessons: [
    { id: 1, title: 'Greetings', level: 'Beginner', description: 'Basic greetings and introductions', content: 'Muraho = Hello. Mwaramutse = Good morning.' },
    { id: 2, title: 'Numbers', level: 'Beginner', description: 'Learn the basics of counting', content: 'Rimwe, kabiri, gatatu...' },
    { id: 3, title: 'Family', level: 'Beginner', description: 'Vocabulary for daily family life', content: 'Umubyeyi = parent, Umwana = child' },
  ],
  vocabulary: [
    { id: 1, word: 'Muraho', meaning: 'Hello', example_sentence: 'Muraho neza!' },
    { id: 2, word: 'Murakoze', meaning: 'Thank you', example_sentence: 'Murakoze cyane.' },
  ],
  quizzes: [
    { id: 1, question: 'What does Muraho mean?', option1: 'Hello', option2: 'Goodbye', option3: 'Thank you', option4: 'No', answer: 'Hello' },
    { id: 2, question: 'What does Murakoze mean?', option1: 'Please', option2: 'Thank you', option3: 'Good night', option4: 'Welcome', answer: 'Thank you' },
    { id: 3, question: 'Which word means “yes”?', option1: 'Oya', option2: 'Muraho', option3: 'Yego', option4: 'Murakoze', answer: 'Yego' },
  ],
};

const pool = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME
  ? mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      ssl: process.env.DB_SSL === 'true' ? {} : undefined,
    })
  : null;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (allowedOrigins.includes(origin)) return true;

  try {
    return allowedOrigins.includes(new URL(origin).host);
  } catch {
    return false;
  }
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production.');
}

app.use(cors({
  origin(origin, callback) {
    const localDevelopmentOrigin = process.env.NODE_ENV !== 'production'
      && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
    if (!origin || isAllowedOrigin(origin) || localDevelopmentOrigin) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20kb' }));

function databaseRequired(res) {
  if (pool) return false;
  res.status(503).json({ error: 'Authentication and administration require a configured MySQL database.' });
  return true;
}

async function readRows(query, params, fallback) {
  if (!pool) return fallback;

  const [rows] = await pool.query(query, params);
  return rows;
}

async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (databaseRequired(res)) return;

    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1',
      [payload.id],
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'This account no longer exists.' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }

    console.error('Authentication failed:', error.message);
    res.status(500).json({ error: 'Unable to verify your account right now.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access is required.' });
  }
  next();
}

async function verifyRegistrationReceipt(txHash, walletAddress, registrationHash) {
  const contractAddress = process.env.REGISTRATION_CONTRACT_ADDRESS;
  const rpcUrl = process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';

  if (!contractAddress || !isAddress(contractAddress)) {
    throw new Error('The registration contract is not configured on the server.');
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash) || !isHexString(registrationHash, 32)) {
    throw new Error('The blockchain receipt details are invalid.');
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  if (network.chainId !== 80002n) {
    throw new Error('The registration provider must be connected to Polygon Amoy (chain ID 80002).');
  }

  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt || receipt.status !== 1) {
    throw new Error('The registration transaction was not confirmed successfully.');
  }

  const expectedWallet = getAddress(walletAddress);
  const expectedHash = registrationHash.toLowerCase();
  const matchingEvent = receipt.logs.some((log) => {
    if (log.address.toLowerCase() !== contractAddress.toLowerCase()) return false;

    try {
      const event = registrationInterface.parseLog(log);
      return event
        && getAddress(event.args.account) === expectedWallet
        && event.args.registrationHash.toLowerCase() === expectedHash;
    } catch {
      return false;
    }
  });

  if (!matchingEvent) {
    throw new Error('The transaction does not contain a matching registration receipt.');
  }
}

app.get('/api/health', async (req, res) => {
  if (!pool) {
    return res.json({
      status: 'ok',
      database: 'not-configured',
      blockchain: process.env.REGISTRATION_CONTRACT_ADDRESS ? 'configured' : 'not-configured',
    });
  }

  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      blockchain: process.env.REGISTRATION_CONTRACT_ADDRESS ? 'configured' : 'not-configured',
    });
  } catch (error) {
    console.error('Health check could not reach MySQL:', error.message);
    res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

app.get('/api/lessons', async (req, res) => {
  const lessons = await readRows(
    'SELECT id, title, level, description, content FROM lessons ORDER BY id',
    [],
    sampleData.lessons,
  );
  res.json(lessons);
});

app.get('/api/vocabulary', async (req, res) => {
  const vocabulary = await readRows(
    'SELECT id, word, meaning, example_sentence FROM vocabulary ORDER BY id',
    [],
    sampleData.vocabulary,
  );
  res.json(vocabulary);
});

app.get('/api/quizzes', async (req, res) => {
  const quizzes = await readRows(
    'SELECT id, question, option1, option2, option3, option4 FROM quizzes ORDER BY id',
    [],
    sampleData.quizzes.map(({ answer, ...question }) => question),
  );
  res.json(quizzes);
});

app.post('/api/quizzes/:id/answer', async (req, res) => {
  const id = Number(req.params.id);
  const selectedAnswer = typeof req.body?.answer === 'string' ? req.body.answer : '';
  if (!Number.isInteger(id) || id < 1 || !selectedAnswer) {
    return res.status(400).json({ error: 'A valid question and answer are required.' });
  }

  try {
    let question;
    if (pool) {
      const [rows] = await pool.query('SELECT answer FROM quizzes WHERE id = ? LIMIT 1', [id]);
      question = rows[0];
    } else {
      question = sampleData.quizzes.find((item) => item.id === id);
    }

    if (!question) return res.status(404).json({ error: 'Quiz question not found.' });
    res.json({
      correct: question.answer === selectedAnswer,
      correctAnswer: question.answer,
    });
  } catch (error) {
    console.error('Quiz answer check failed:', error.message);
    res.status(500).json({ error: 'Unable to check this answer right now.' });
  }
});

app.get('/api/forum/posts', async (req, res) => {
  if (databaseRequired(res)) return;

  try {
    const [posts] = await pool.query(
      `SELECT p.id, p.title, p.body, p.created_at, u.name AS author_name
       FROM forum_posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT 50`,
    );
    res.json(posts);
  } catch (error) {
    console.error('Forum posts could not be loaded:', error.message);
    res.status(500).json({ error: 'Unable to load forum posts right now.' });
  }
});

app.post('/api/forum/posts', requireAuth, async (req, res) => {
  if (databaseRequired(res)) return;

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
  if (!title || title.length > 200 || !body || body.length > 5000) {
    return res.status(400).json({ error: 'A title (1-200 characters) and post (1-5000 characters) are required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO forum_posts (user_id, title, body) VALUES (?, ?, ?)',
      [req.user.id, title, body],
    );
    res.status(201).json({
      id: result.insertId,
      title,
      body,
      author_name: req.user.name,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Forum post could not be created:', error.message);
    res.status(500).json({ error: 'Unable to create this post right now.' });
  }
});

app.post('/api/register/check', async (req, res) => {
  if (databaseRequired(res)) return;

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const walletAddress = req.body?.walletAddress;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !isAddress(walletAddress)) {
    return res.status(400).json({ error: 'Enter a valid email address and connect a wallet.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR wallet_address = ? LIMIT 1',
      [email, getAddress(walletAddress)],
    );
    if (rows.length) return res.status(409).json({ error: 'That email or wallet is already registered.' });
    res.json({ available: true });
  } catch (error) {
    console.error('Registration preflight failed:', error.message);
    res.status(500).json({ error: 'Unable to verify your registration details.' });
  }
});

app.post('/api/register', async (req, res) => {
  if (databaseRequired(res)) return;

  const { name, email, password, walletAddress, registrationHash, transactionHash } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 120) {
    return res.status(400).json({ error: 'Enter a name between 2 and 120 characters.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 160) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
    return res.status(400).json({ error: 'Use a password between 10 and 128 characters.' });
  }
  if (!isAddress(walletAddress)) {
    return res.status(400).json({ error: 'Connect a valid wallet to record your registration.' });
  }

  try {
    await verifyRegistrationReceipt(transactionHash, walletAddress, registrationHash);
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      `INSERT INTO users
        (name, email, password, role, wallet_address, registration_hash, registration_tx_hash)
       VALUES (?, ?, ?, 'student', ?, ?, ?)`,
      [
        name.trim(),
        normalizedEmail,
        passwordHash,
        getAddress(walletAddress),
        registrationHash.toLowerCase(),
        transactionHash.toLowerCase(),
      ],
    );
    const user = {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      role: 'student',
      walletAddress: getAddress(walletAddress),
    };
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '12h' });
    res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That email or wallet is already registered.' });
    }
    if (error.message.includes('registration') || error.message.includes('Polygon Amoy') || error.message.includes('transaction')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Account registration failed:', error.message);
    res.status(500).json({ error: 'Unable to create your account right now.' });
  }
});

app.post('/api/login', async (req, res) => {
  if (databaseRequired(res)) return;

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, wallet_address FROM users WHERE email = ? LIMIT 1',
      [email],
    );

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const record = rows[0];
    const user = {
      id: record.id,
      name: record.name,
      email: record.email,
      role: record.role,
      walletAddress: record.wallet_address,
    };
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user });
  } catch (error) {
    console.error('Login failed:', error.message);
    res.status(500).json({ error: 'Unable to sign in right now.' });
  }
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/admin/overview', requireAuth, requireAdmin, async (req, res) => {
  if (databaseRequired(res)) return;

  try {
    const [users] = await pool.query('SELECT COUNT(*) AS count FROM users');
    const [lessons] = await pool.query('SELECT COUNT(*) AS count FROM lessons');
    const [quizzes] = await pool.query('SELECT COUNT(*) AS count FROM quizzes');
    const [posts] = await pool.query('SELECT COUNT(*) AS count FROM forum_posts');
    res.json({
      users: users[0].count,
      lessons: lessons[0].count,
      quizzes: quizzes[0].count,
      forumPosts: posts[0].count,
    });
  } catch (error) {
    console.error('Admin overview failed:', error.message);
    res.status(500).json({ error: 'Unable to load admin statistics.' });
  }
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  if (databaseRequired(res)) return;

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, wallet_address, created_at FROM users ORDER BY created_at DESC LIMIT 100',
    );
    res.json(rows);
  } catch (error) {
    console.error('Admin user list failed:', error.message);
    res.status(500).json({ error: 'Unable to load users.' });
  }
});

app.get('/api/admin/lessons', requireAuth, requireAdmin, async (req, res) => {
  if (databaseRequired(res)) return;
  const lessons = await readRows('SELECT id, title, level, description, content FROM lessons ORDER BY id DESC', [], []);
  res.json(lessons);
});

app.post('/api/admin/lessons', requireAuth, requireAdmin, async (req, res) => {
  if (databaseRequired(res)) return;
  const { title, level, description, content } = req.body || {};
  if (!title?.trim() || !['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
    return res.status(400).json({ error: 'A lesson title and valid level are required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO lessons (title, level, description, content) VALUES (?, ?, ?, ?)',
      [title.trim(), level, description || '', content || ''],
    );
    res.status(201).json({ id: result.insertId, title: title.trim(), level, description, content });
  } catch (error) {
    console.error('Lesson creation failed:', error.message);
    res.status(500).json({ error: 'Unable to create this lesson.' });
  }
});

app.delete('/api/admin/lessons/:id', requireAuth, requireAdmin, async (req, res) => {
  if (databaseRequired(res)) return;
  try {
    const [result] = await pool.query('DELETE FROM lessons WHERE id = ?', [Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Lesson not found.' });
    res.status(204).end();
  } catch (error) {
    console.error('Lesson deletion failed:', error.message);
    res.status(500).json({ error: 'Unable to delete this lesson.' });
  }
});

app.get('/api/admin/quizzes', requireAuth, requireAdmin, async (req, res) => {
  if (databaseRequired(res)) return;
  const quizzes = await readRows(
    'SELECT id, question, option1, option2, option3, option4, answer FROM quizzes ORDER BY id DESC',
    [],
    [],
  );
  res.json(quizzes);
});

app.post('/api/admin/quizzes', requireAuth, requireAdmin, async (req, res) => {
  if (databaseRequired(res)) return;
  const { question, options, answer } = req.body || {};
  if (
    typeof question !== 'string'
    || !question.trim()
    || !Array.isArray(options)
    || options.length !== 4
    || options.some((option) => typeof option !== 'string' || !option.trim())
    || !options.includes(answer)
  ) {
    return res.status(400).json({ error: 'Provide a question, four answer options, and the correct answer.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO quizzes (question, option1, option2, option3, option4, answer)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [question.trim(), ...options.map((option) => option.trim()), answer.trim()],
    );
    res.status(201).json({ id: result.insertId, question: question.trim(), options, answer });
  } catch (error) {
    console.error('Quiz creation failed:', error.message);
    res.status(500).json({ error: 'Unable to create this quiz.' });
  }
});

app.delete('/api/admin/quizzes/:id', requireAuth, requireAdmin, async (req, res) => {
  if (databaseRequired(res)) return;
  try {
    const [result] = await pool.query('DELETE FROM quizzes WHERE id = ?', [Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Quiz not found.' });
    res.status(204).end();
  } catch (error) {
    console.error('Quiz deletion failed:', error.message);
    res.status(500).json({ error: 'Unable to delete this quiz.' });
  }
});

app.use((error, req, res, next) => {
  console.error('Request failed:', error.message);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(`Kinyarwanda API listening on port ${PORT}`);
});
