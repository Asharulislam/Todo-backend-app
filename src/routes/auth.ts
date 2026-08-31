import express from 'express';
import { register, login } from '../controllers/auth_controller.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Registration and login
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, email, password]
 *             properties:
 *               first_name: { type: string, example: Ada }
 *               last_name:  { type: string, example: Lovelace }
 *               email:      { type: string, format: email, example: ada@example.com }
 *               password:   { type: string, minLength: 6, example: secret123 }
 *     responses:
 *       201:
 *         description: Created — returns the user and a JWT
 *       400:
 *         description: first_name, email and password are required
 *       409:
 *         description: Email already registered
 */
router.post('/register', register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: ada@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200:
 *         description: OK — returns the user and a JWT
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

export default router;
