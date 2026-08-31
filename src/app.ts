import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import pool from './config/db.js';

dotenv.config();

const app = express();
app.use(express.json());

// Temporary test route
app.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'DB connected!', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
