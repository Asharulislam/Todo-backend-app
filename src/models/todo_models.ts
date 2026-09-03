import prisma from '../config/prisma.js';
import { Prisma } from '../generated/prisma/client.js';

interface CreateTodoInput {
  user_id: number;
  title: string;
  is_important: boolean;
}

interface UpdateTodoData {
  title?: string;
  is_important?: boolean;
  is_completed?: boolean;
}

const todoSelect = {
  id: true,
  title: true,
  is_important: true,
  is_completed: true,
  created_at: true,
} satisfies Prisma.todosSelect;

export const createTodo = (data: CreateTodoInput) =>
  prisma.todos.create({ data, select: todoSelect });

export const findTodoById = (id: number) =>
  prisma.todos.findUnique({ where: { id } });

export const updateTodo = (id: number, data: UpdateTodoData) =>
  prisma.todos.update({ where: { id }, data, select: todoSelect });

export const deleteTodo = (id: number) =>
  prisma.todos.delete({ where: { id } });

export const listTodos = (where: Prisma.todosWhereInput, skip: number, take: number) =>
  prisma.$transaction([
    prisma.todos.findMany({
      where,
      select: todoSelect,
      orderBy: { created_at: 'desc' },
      skip,
      take,
    }),
    prisma.todos.count({ where }),
  ]);
