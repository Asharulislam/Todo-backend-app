import { Request, Response, NextFunction } from 'express';
import * as todoService from '../services/todo_service.js';
import type { TodoFilter } from '../services/todo_service.js';

const parseId = (value: unknown): number => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : NaN;
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, is_important } = req.body ?? {};

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }
    if (is_important !== undefined && typeof is_important !== 'boolean') {
      return res.status(400).json({ error: 'is_important must be a boolean' });
    }

    const task = await todoService.createTask({ userId: req.user!.id, title, is_important });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

export const listTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed: TodoFilter[] = ['all', 'completed', 'important'];
    const filterParam = String(req.query.filter ?? 'all') as TodoFilter;
    const filter = allowed.includes(filterParam) ? filterParam : 'all';

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const result = await todoService.listTasks({ userId: req.user!.id, filter, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseId(req.params.id);
    if (Number.isNaN(taskId)) return res.status(400).json({ error: 'invalid task id' });

    const { title, is_important, is_completed } = req.body ?? {};

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    if (is_important !== undefined && typeof is_important !== 'boolean') {
      return res.status(400).json({ error: 'is_important must be a boolean' });
    }
    if (is_completed !== undefined && typeof is_completed !== 'boolean') {
      return res.status(400).json({ error: 'is_completed must be a boolean' });
    }

    const task = await todoService.updateTask({
      userId: req.user!.id,
      taskId,
      title,
      is_important,
      is_completed,
    });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const setTaskCompleted = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseId(req.params.id);
    if (Number.isNaN(taskId)) return res.status(400).json({ error: 'invalid task id' });

    const { is_completed } = req.body ?? {};
    const value = is_completed === undefined ? true : is_completed;
    if (typeof value !== 'boolean') {
      return res.status(400).json({ error: 'is_completed must be a boolean' });
    }

    const task = await todoService.setCompleted(req.user!.id, taskId, value);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseId(req.params.id);
    if (Number.isNaN(taskId)) return res.status(400).json({ error: 'invalid task id' });

    await todoService.deleteTask(req.user!.id, taskId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
