import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { MongoClient, type Db } from 'mongodb';
import dns from 'node:dns';

// Force DNS lookups through Google's public resolvers (8.8.8.8 / 8.8.4.4).
// Required on some local/ISP networks where the default resolver fails to
// resolve MongoDB Atlas SRV hostnames, causing connection timeouts at startup.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

// ─── Express app ────────────────────────────────────────────────────────────

const app = express();
const port = process.env.PORT ?? 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ─── MongoDB connection ──────────────────────────────────────────────────────

const mongoUrl =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/tripcraft';

// `db` starts undefined; it is set after MongoClient connects successfully.
// Route files that need the database should import this module and read `db`.
// The /api/health endpoint reflects whether the connection is ready.
export let db: Db | undefined;

MongoClient.connect(mongoUrl)
  .then((client) => {
    db = client.db();
    console.log('✅ Connected to MongoDB');
  })
  .catch((err: unknown) => {
    console.error('❌ Failed to connect to MongoDB:', err);
  });

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  if (db === undefined) {
    res.status(503).json({ status: 'error', db: 'not connected' });
    return;
  }
  res.json({ status: 'ok', db: 'connected' });
});

// ─── Centralised error handler ───────────────────────────────────────────────

// Must have exactly four parameters so Express recognises it as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const message =
    err instanceof Error ? err.message : 'An unexpected error occurred';
  res.status(500).json({ status: 'error', message });
});

// ─── Start server ────────────────────────────────────────────────────────────

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});