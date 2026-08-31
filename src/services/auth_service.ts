import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/user_models.js';
import AppError from '../utils/app_error.js';

const signToken = (id: number): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

interface RegisterInput {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async ({ first_name, last_name, email, password }: RegisterInput) => {
  const existing = await userModel.findByEmail(email);
  if (existing) throw new AppError('Email already registered', 409);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.createUser({
    first_name,
    last_name: last_name || null,
    email,
    password: hashedPassword,
  });

  return { user, token: signToken(user.id) };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw new AppError('Invalid credentials', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  return {
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    },
    token: signToken(user.id),
  };
};