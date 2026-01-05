import { Server } from 'socket.io';
import { socketHelper } from '@/utils/socketHelper';
import socketHandler from '@/utils/socketHandler';

let io;

const initSocket = (server) => {
	io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? ['https://calo-cook.vercel.app']
          : ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  })

	return io;
};

const getIO = () => {
	if (!io) {
		throw new Error('Socket.io not initialized!');
	}
	return io;
};

export { initSocket, getIO };
