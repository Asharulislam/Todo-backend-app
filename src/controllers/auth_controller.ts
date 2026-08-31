import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth_service.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !email || !password) {
      return res.status(400).json({ error: 'first_name, email and password are required' });
    }

    const result = await authService.registerUser({ first_name, last_name, email, password });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.loginUser({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
};