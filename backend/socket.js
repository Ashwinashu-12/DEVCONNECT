import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';
import User from './models/User.js';
import { createNotification } from './services/notificationService.js';

let io;
const onlineUsers = new Map(); // userId -> socketId

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    // Auth Middleware for Socket
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Mark user as online
        onlineUsers.set(socket.userId, socket.id);
        io.emit('user_status', { userId: socket.userId, online: true });

        // Join personal room
        socket.join(socket.userId);

        // Handle private message
        socket.on('send_message', async (data) => {
            const { receiverId, text, conversationId } = data;
            console.log(`[Socket] Message from ${socket.userId} to ${receiverId}: ${text}`);

            try {
                if (!receiverId || !text) {
                    console.error('[Socket] Missing receiverId or text');
                    return;
                }

                let convId = conversationId;

                // Find or create conversation
                if (!convId) {
                    console.log('[Socket] No conversationId provided, finding/creating...');
                    let conversation = await Conversation.findOne({
                        participants: { $all: [socket.userId, receiverId] }
                    });

                    if (!conversation) {
                        console.log('[Socket] Creating new conversation');
                        conversation = await Conversation.create({
                            participants: [socket.userId, receiverId]
                        });
                    }
                    convId = conversation._id;
                }

                // Create message
                const message = await Message.create({
                    conversationId: convId,
                    sender: socket.userId,
                    receiver: receiverId,
                    text
                });

                // Update conversation's last message
                await Conversation.findByIdAndUpdate(convId, {
                    lastMessage: message._id
                });

                const populatedMessage = await message.populate('sender', 'name avatar');
                console.log('[Socket] Message saved and populated');

                // Send to receiver
                io.to(receiverId).emit('receive_message', populatedMessage);
                console.log(`[Socket] Message emitted to receiver: ${receiverId}`);

                // Send back to sender for confirmation
                socket.emit('message_sent', populatedMessage);
                console.log('[Socket] Confirmation emitted back to sender');

                // Create notification for message (non-blocking)
                createNotification({
                    recipient: receiverId,
                    sender: socket.userId,
                    type: 'message',
                    text: `${populatedMessage.sender.name} sent you a message`
                }).catch(err => console.error('[Socket] Notification error:', err));

                // Notify of new conversation if it was new
                if (!conversationId) {
                    io.to(receiverId).emit('new_conversation', convId);
                }

            } catch (error) {
                console.error('[Socket] send_message error:', error);
            }
        });

        // Handle typing status
        socket.on('typing', (data) => {
            io.to(data.receiverId).emit('display_typing', { senderId: socket.userId });
        });

        socket.on('stop_typing', (data) => {
            io.to(data.receiverId).emit('hide_typing', { senderId: socket.userId });
        });

        // Mark messages as read
        socket.on('mark_read', async (data) => {
            const { conversationId } = data;
            await Message.updateMany(
                { conversationId, receiver: socket.userId, read: false },
                { $set: { read: true } }
            );
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
            onlineUsers.delete(socket.userId);
            io.emit('user_status', { userId: socket.userId, online: false });
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

export const getOnlineUsers = () => Array.from(onlineUsers.keys());
