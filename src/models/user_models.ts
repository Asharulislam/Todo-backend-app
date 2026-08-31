import prisma from '../config/prisma.js';

interface CreateUserInput {
  first_name: string;
  last_name: string | null;
  email: string;
  password: string;
}

export const findByEmail = (email: string) =>
  prisma.users.findUnique({ where: { email } });

export const createUser = (data: CreateUserInput) =>
  prisma.users.create({
    data,
    select: { id: true, first_name: true, last_name: true, email: true },
  });