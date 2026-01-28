import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '@/config/swagger';
import { API_v1 } from '@/routes/index';
import connectDB from '@/config/mongoose';
import { createServer } from 'http';
import { initSocket } from '@/config/socket';
import { socketHelper } from '@/utils/socketHelper';
import { handleSocketConnection } from '@/utils/socketHandler';
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Connect to MongoDB
connectDB();

// Cors
app.use(cors());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.IO
const io = initSocket(httpServer);

// Handle Socket.IO connections
handleSocketConnection(io);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Make io available globally for controllers
app.set('socketio', io);

// Api V1 Routes
app.use('/api/v1', API_v1);

// Socket.IO status endpoint
app.get('/socket-status', (req, res) => {
	res.json({
		status: 'Socket.IO is running',
		connectedClients: socketHelper.utils.getConnectedClientsCount(),
		isConnected: socketHelper.utils.isConnected(),
		timestamp: new Date(),
	});
});

// Fallback 404 for unknown routes
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: 'Route not found',
	});
});

// Central error handler (ensures JSON responses)
app.use((err, req, res, next) => {
	const status = err?.status || err?.statusCode || 500;
	let message = err?.message || 'Server error';

	if (err?.name === 'ValidationError' && err?.errors) {
		const firstKey = Object.keys(err.errors)[0];
		const firstMessage = firstKey ? err.errors[firstKey]?.message : null;
		if (firstMessage) message = firstMessage;
	}

	res.status(status).json({
		success: false,
		message,
	});
});

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
  console.log(`Socket.IO server is running`);
});
