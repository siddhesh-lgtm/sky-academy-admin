import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import adminRoutes from './routes/admin.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = corsOrigin.split(',').map((s) => s.trim());
    if (allowed.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`CORS blocked for ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

app.get('/api/v1/health', async (_req, res, next) => {
  try {
    await db.query('SELECT 1');
    const [tables] = await db.query(
      `SELECT COUNT(*) AS n FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'`,
    );
    res.json({ ok: true, database: 'connected', tables: Number(tables[0].n), service: 'sky-academy-admin-api' });
  } catch (err) {
    next(err);
  }
});

// DEVELOPMENT ONLY: no authentication attached. Do not expose publicly.
app.use('/api/v1/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Unexpected server error' });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`SKY admin API http://127.0.0.1:${port}`);
  console.log(`Health check  http://127.0.0.1:${port}/api/v1/health`);
});
