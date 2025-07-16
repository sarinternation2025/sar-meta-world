// src/models/Message.js - Message model for MongoDB
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  roomId: {
    type: String,
    default: 'general'
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file', 'audio', 'video']
    },
    url: String,
    filename: String,
    size: Number
  }],
  reactions: [{
    emoji: String,
    userId: String,
    username: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    messageId: String,
    content: String,
    username: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ roomId: 1, timestamp: -1 });
messageSchema.index({ userId: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
