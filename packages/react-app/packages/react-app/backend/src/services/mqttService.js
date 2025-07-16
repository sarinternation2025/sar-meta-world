// src/services/mqttService.js - MQTT service
const mqtt = require('mqtt');
const { logger } = require('../utils/logger');

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  connect(options = {}) {
    const config = {
      host: process.env.MQTT_BROKER_URL,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      clientId: process.env.MQTT_CLIENT_ID,
      ...options
    };

    this.client = mqtt.connect(config.host, {
      username: config.username,
      password: config.password,
      clientId: config.clientId
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('MQTT Client connected successfully');
      this.subscribeToTopics();
    });

    this.client.on('error', (error) => {
      logger.error(`MQTT Client error: ${error.message}`);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.info('MQTT Client disconnected');
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });

    return this.client;
  }

  subscribeToTopics() {
    const topics = [
      'chat/messages',
      'chat/typing',
      'chat/user-status',
      'chat/rooms/+/messages'
    ];

    topics.forEach(topic => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          logger.error(`Failed to subscribe to topic ${topic}: ${err.message}`);
        } else {
          logger.info(`Subscribed to topic: ${topic}`);
        }
      });
    });
  }

  handleMessage(topic, message) {
    try {
      const messageData = JSON.parse(message.toString());
      logger.info(`Received message on topic ${topic}:`, messageData);
      
      // Emit to appropriate handlers based on topic
      if (topic.startsWith('chat/messages')) {
        this.handleChatMessage(messageData);
      } else if (topic.startsWith('chat/typing')) {
        this.handleTypingIndicator(messageData);
      } else if (topic.startsWith('chat/user-status')) {
        this.handleUserStatus(messageData);
      }
    } catch (error) {
      logger.error(`Error parsing MQTT message: ${error.message}`);
    }
  }

  handleChatMessage(messageData) {
    // Handle chat message logic
    logger.info('Processing chat message:', messageData);
  }

  handleTypingIndicator(messageData) {
    // Handle typing indicator logic
    logger.info('Processing typing indicator:', messageData);
  }

  handleUserStatus(messageData) {
    // Handle user status logic
    logger.info('Processing user status:', messageData);
  }

  publish(topic, message, options = {}) {
    if (!this.isConnected) {
      logger.error('MQTT Client not connected');
      return false;
    }

    const messageString = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.client.publish(topic, messageString, options, (err) => {
      if (err) {
        logger.error(`Failed to publish message to topic ${topic}: ${err.message}`);
      } else {
        logger.info(`Message published to topic ${topic}`);
      }
    });

    return true;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
      logger.info('MQTT Client disconnected');
    }
  }
}

module.exports = new MQTTService();
