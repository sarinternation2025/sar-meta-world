-- Sample Database Backup Placeholder
-- This is a placeholder backup file with sample data for demonstration
-- Generated on: 2024-01-15 10:30:00

-- PostgreSQL Database Backup
-- Version: 15.x
-- Encoding: UTF8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Sample data for users table
INSERT INTO users (id, username, email, password_hash, status, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'online', '2024-01-01 00:00:00'),
('550e8400-e29b-41d4-a716-446655440001', 'user1', 'user1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'offline', '2024-01-02 00:00:00'),
('550e8400-e29b-41d4-a716-446655440002', 'user2', 'user2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'online', '2024-01-03 00:00:00'),
('550e8400-e29b-41d4-a716-446655440003', 'alice', 'alice@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'away', '2024-01-04 00:00:00'),
('550e8400-e29b-41d4-a716-446655440004', 'bob', 'bob@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'offline', '2024-01-05 00:00:00');

-- Sample data for rooms table
INSERT INTO rooms (id, name, description, type, created_by, created_at) VALUES
('650e8400-e29b-41d4-a716-446655440000', 'General', 'General discussion room', 'public', '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 00:00:00'),
('650e8400-e29b-41d4-a716-446655440001', 'Random', 'Random chat room', 'public', '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 00:00:00'),
('650e8400-e29b-41d4-a716-446655440002', 'Tech Talk', 'Technical discussions', 'public', '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 00:00:00'),
('650e8400-e29b-41d4-a716-446655440003', 'Private Chat', 'Private discussion room', 'private', '550e8400-e29b-41d4-a716-446655440003', '2024-01-05 00:00:00');

-- Sample data for messages table
INSERT INTO messages (id, room_id, user_id, content, message_type, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Welcome to the chat room!', 'text', '2024-01-01 00:05:00'),
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Hello everyone!', 'text', '2024-01-01 00:10:00'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'How is everyone doing?', 'text', '2024-01-01 00:15:00'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Let''s discuss the latest tech trends', 'text', '2024-01-01 00:20:00'),
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'AI and machine learning are fascinating!', 'text', '2024-01-01 00:25:00'),
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Random fact: Did you know...', 'text', '2024-01-01 00:30:00');

-- Sample data for room_members table
INSERT INTO room_members (id, room_id, user_id, role, joined_at) VALUES
('850e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin', '2024-01-01 00:00:00'),
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'member', '2024-01-01 00:01:00'),
('850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'member', '2024-01-01 00:02:00'),
('850e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'member', '2024-01-01 00:03:00'),
('850e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'member', '2024-01-01 00:04:00'),
('850e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'admin', '2024-01-05 00:00:00');

-- Sample metrics data (for InfluxDB-like time series)
-- This would typically be in InfluxDB format, but shown as SQL for reference
/*
Message activity metrics:
- messages_sent,room=general,user=admin value=1 1704067500000000000
- messages_sent,room=general,user=user1 value=1 1704067800000000000
- messages_sent,room=general,user=user2 value=1 1704068100000000000
- user_online,user=admin value=1 1704067200000000000
- user_online,user=user2 value=1 1704067200000000000
- room_activity,room=general value=3 1704068100000000000
- room_activity,room=tech_talk value=2 1704068100000000000
*/

-- Sample Redis-like key-value data
/*
session:user:550e8400-e29b-41d4-a716-446655440000 = {"userId": "550e8400-e29b-41d4-a716-446655440000", "username": "admin", "lastActivity": "2024-01-01T00:30:00Z"}
session:user:550e8400-e29b-41d4-a716-446655440002 = {"userId": "550e8400-e29b-41d4-a716-446655440002", "username": "user2", "lastActivity": "2024-01-01T00:25:00Z"}
room:650e8400-e29b-41d4-a716-446655440000:members = ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"]
chat:typing:650e8400-e29b-41d4-a716-446655440000 = []
*/

-- Sample MQTT topics and messages
/*
chat/messages/general - {"id": "750e8400-e29b-41d4-a716-446655440000", "content": "Welcome to the chat room!", "user": "admin", "timestamp": "2024-01-01T00:05:00Z"}
chat/typing/general - {"user": "user1", "isTyping": true, "timestamp": "2024-01-01T00:09:30Z"}
chat/user-status - {"user": "admin", "status": "online", "timestamp": "2024-01-01T00:00:00Z"}
system/heartbeat - {"timestamp": "2024-01-01T00:30:00Z", "server": "chat-backend"}
*/

-- Statistics
-- Total users: 5
-- Total rooms: 4
-- Total messages: 6
-- Active users: 2
-- Public rooms: 3
-- Private rooms: 1
