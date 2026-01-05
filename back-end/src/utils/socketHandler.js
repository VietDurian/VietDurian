import { socketHelper } from '@/utils/socketHelper'

export const handleSocketConnection = (io) => {
  // Set socket instance to helper
  socketHelper.setSocketIO(io)

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected with socket ID: ${socket.id}`)

    // Join user to their own room for private messaging
    socket.join(`user_${socket.user._id}`)

    // Handle admin room joining
    socket.on('join_admin_room', () => {
      if (socket.user.role === 'admin' || socket.user.isAdmin) {
        socket.join('admin_room')
        console.log(`Admin ${socket.user.username} joined admin room`)
      }
    })

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.broadcast.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: socket.user._id,
        username: socket.user.username,
        isTyping: data.isTyping
      })
    })

    // Handle conversation room joining (for specific conversations)
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`)
      console.log(`User ${socket.user.username} joined conversation ${conversationId}`)
    })

    // Handle conversation room leaving
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`)
      console.log(`User ${socket.user.username} left conversation ${conversationId}`)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`)
    })
  })
}
