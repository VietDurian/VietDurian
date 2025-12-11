import express from 'express';

import { authRoute } from '@/routes/authRoute';
import { userRoute } from '@/routes/userRoute';

const Router = express.Router();

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Health check API
 *     description: Check if the server is running
 *     responses:
 *       200:
 *         description: Server is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
Router.get('/status', (req, res) => {
	res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Router.use('/auth', authRoute);
// Router.use('/user', userRoute);

export const API_v1 = Router;
