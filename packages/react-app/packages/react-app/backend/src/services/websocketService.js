// src/services/websocketService.js - WebSocket service
const { logger } = require('../utils/logger');
const mqttService = require('./mqttService');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(io) {
    this.io = io;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`New WebSocket connection: ${socket.id}`);

      // Handle user authentication/identification
      socket.on('authenticate', (userData) => {
        this.handleAuthentication(socket, userData);
      });

      // Handle chat messages
      socket.on('sendMessage', (messageData) => {
        this.handleSendMessage(socket, messageData);
      });

      // Handle typing indicators
      socket.on('typing', (typingData) => {
        this.handleTyping(socket, typingData);
      });

      // Handle user joining/leaving rooms
      socket.on('joinRoom', (roomData) => {
        this.handleJoinRoom(socket, roomData);
      });

      socket.on('leaveRoom', (roomData) => {
        this.handleLeaveRoom(socket, roomData);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleAuthentication(socket, userData) {
    try {
      // Store user information
      this.connectedUsers.set(socket.id, {
        userId: userData.userId,
        username: userData.username,
        socketId: socket.id,
        connectedAt: new Date()
      });

      // Join user to their personal room
      socket.join(`user_${userData.userId}`);

      // Broadcast user status
      const statusMessage = {
        userId: userData.userId,
        username: userData.username,
        status: 'online',
        timestamp: new Date()
      };

      mqttService.publish('chat/user-status', statusMessage);
      
      socket.emit('authenticated', { success: true });
      logger.info(`User ${userData.username} authenticated with socket ${socket.id}`);
    } catch (error) {
      logger.error(`Authentication error: ${error.message}`);
      socket.emit('error', { message: 'Authentication failed' });
    }
  }

  handleSendMessage(socket, messageData) {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      const message = {
        id: this.generateMessageId(),
        userId: user.userId,
        username: user.username,
        content: messageData.content,
        roomId: messageData.roomId || 'general',
        timestamp: new Date(),
        type: messageData.type || 'text'
      };

      // Publish to MQTT
      const mqttTopic = messageData.roomId ? 
        `chat/rooms/${messageData.roomId}/messages` : 
        'chat/messages';
      
      mqttService.publish(mqttTopic, message);

      // Broadcast to room members via WebSocket
      this.broadcastToRoom(messageData.roomId || 'general', 'newMessage', message);

      logger.info(`Message sent by ${user.username} to room ${message.roomId}`);
    } catch (error) {
      logger.error(`Send message error: ${error.message}`);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTyping(socket, typingData) {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user) return;

      const typingMessage = {
        userId: user.userId,
        username: user.username,
        roomId: typingData.roomId || 'general',
        isTyping: typingData.isTyping,
        timestamp: new Date()
      };

      // Publish to MQTT
      mqttService.publish('chat/typing', typingMessage);

      // Broadcast to room members (excluding sender)
      socket.to(typingData.roomId || 'general').emit('userTyping', typingMessage);
    } catch (error) {
      logger.error(`Typing indicator error: ${error.message}`);
    }
  }

  handleJoinRoom(socket, roomData) {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user) return;

      socket.join(roomData.roomId);
      
      const joinMessage = {
        userId: user.userId,
        username: user.username,
        roomId: roomData.roomId,
        action: 'joined',
        timestamp: new Date()
      };

      this.broadcastToRoom(roomData.roomId, 'userJoined', joinMessage);
      logger.info(`User ${user.username} joined room ${roomData.roomId}`);
    } catch (error) {
      logger.error(`Join room error: ${error.message}`);
    }
  }

  handleLeaveRoom(socket, roomData) {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user) return;

      socket.leave(roomData.roomId);
      
      const leaveMessage = {
        userId: user.userId,
        username: user.username,
        roomId: roomData.roomId,
        action: 'left',
        timestamp: new Date()
      };

      this.broadcastToRoom(roomData.roomId, 'userLeft', leaveMessage);
      logger.info(`User ${user.username} left room ${roomData.roomId}`);
    } catch (error) {
      logger.error(`Leave room error: ${error.message}`);
    }
  }

  handleDisconnect(socket) {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (user) {
        // Broadcast user offline status
        const statusMessage = {
          userId: user.userId,
          username: user.username,
          status: 'offline',
          timestamp: new Date()
        };

        mqttService.publish('chat/user-status', statusMessage);
        
        // Remove from connected users
        this.connectedUsers.delete(socket.id);
        
        logger.info(`User ${user.username} disconnected`);
      }
    } catch (error) {
      logger.error(`Disconnect error: ${error.message}`);
    }
  }

  broadcastToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  broadcastToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  getUserBySocketId(socketId) {
    return this.connectedUsers.get(socketId);
  }
}

module.exports = new WebSocketService();
