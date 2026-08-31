import express from 'express';
import authRoutes from './auth.js';

const router = express.Router();

router.use('/auth', authRoutes);
// router.use('/todos', todoRoutes);

export default router;
