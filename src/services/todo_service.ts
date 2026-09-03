import * as todoModel from '../models/todo_models.js';
import AppError from '../utils/app_error.js';
import { Prisma } from '../generated/prisma/client.js';

export type TodoFilter = 'all' | 'completed' | 'important';

interface CreateTaskInput {
  userId: number;
  title: string;
  is_important?: boolean;
}

interface UpdateTaskInput {
  userId: number;
  taskId: number;
  title?: string;
  is_important?: boolean;
  is_completed?: boolean;
}

interface ListTasksInput {
  userId: number;
  filter: TodoFilter;
  page: number;
  limit: number;
}

/** Fetch a task and make sure it belongs to the requesting user. */
const getOwnedTask = async (taskId: number, userId: number) => {
  const task = await todoModel.findTodoById(taskId);
  if (!task || task.user_id !== userId) {
    throw new AppError('Task not found', 404);
  }
  return task;
};

export const createTask = ({ userId, title, is_important }: CreateTaskInput) =>
  todoModel.createTodo({
    user_id: userId,
    title: title.trim(),
    is_important: is_important ?? false,
  });

export const listTasks = async ({ userId, filter, page, limit }: ListTasksInput) => {
  const where: Prisma.todosWhereInput = { user_id: userId };
  if (filter === 'completed') where.is_completed = true;
  if (filter === 'important') where.is_important = true;

  const skip = (page - 1) * limit;
  const [items, total] = await todoModel.listTodos(where, skip, limit);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit) || 1,
    },
  };
};

export const updateTask = async ({
  userId,
  taskId,
  title,
  is_important,
  is_completed,
}: UpdateTaskInput) => {
  await getOwnedTask(taskId, userId);

  const data: { title?: string; is_important?: boolean; is_completed?: boolean } = {};
  if (title !== undefined) data.title = title.trim();
  if (is_important !== undefined) data.is_important = is_important;
  if (is_completed !== undefined) data.is_completed = is_completed;

  if (Object.keys(data).length === 0) {
    throw new AppError('No fields to update', 400);
  }

  return todoModel.updateTodo(taskId, data);
};

export const setCompleted = async (userId: number, taskId: number, is_completed: boolean) => {
  await getOwnedTask(taskId, userId);
  return todoModel.updateTodo(taskId, { is_completed });
};

export const deleteTask = async (userId: number, taskId: number) => {
  await getOwnedTask(taskId, userId);
  await todoModel.deleteTodo(taskId);
};
