import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createTask,
  listTasks,
  updateTask,
  setTaskCompleted,
  deleteTask,
} from '../controllers/todo_controller.js';

const router = express.Router();

// Every todo route requires a valid JWT.
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Todos
 *     description: Task management (create, list, update, complete, delete)
 *
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:           { type: integer, example: 1 }
 *         title:        { type: string, example: Buy milk }
 *         is_important: { type: boolean, example: false }
 *         is_completed: { type: boolean, example: false }
 *         created_at:   { type: string, format: date-time }
 */

/**
 * @openapi
 * /todos:
 *   post:
 *     summary: Add a task
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:        { type: string, example: Buy milk }
 *               is_important: { type: boolean, example: false }
 *     responses:
 *       201: { description: Task created }
 *       400: { description: Validation error }
 *       401: { description: Missing or invalid token }
 *   get:
 *     summary: List tasks with pagination and filtering
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema: { type: string, enum: [all, completed, important], default: all }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 100 }
 *     responses:
 *       200: { description: Paginated list of tasks }
 *       401: { description: Missing or invalid token }
 */
router.post('/', createTask);
router.get('/', listTasks);

/**
 * @openapi
 * /todos/{id}:
 *   patch:
 *     summary: Update a task (edit title, toggle important, toggle completed)
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:        { type: string, example: Buy oat milk }
 *               is_important: { type: boolean, example: true }
 *               is_completed: { type: boolean, example: false }
 *     responses:
 *       200: { description: Updated task }
 *       400: { description: Validation error }
 *       401: { description: Missing or invalid token }
 *       404: { description: Task not found }
 *   delete:
 *     summary: Delete a task
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Task deleted }
 *       401: { description: Missing or invalid token }
 *       404: { description: Task not found }
 */
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

/**
 * @openapi
 * /todos/{id}/complete:
 *   patch:
 *     summary: Mark a task as completed (or uncompleted)
 *     tags: [Todos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_completed: { type: boolean, default: true }
 *     responses:
 *       200: { description: Updated task }
 *       401: { description: Missing or invalid token }
 *       404: { description: Task not found }
 */
router.patch('/:id/complete', setTaskCompleted);

export default router;
