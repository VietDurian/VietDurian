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
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
  console.log(`Socket.IO server is running`);
});