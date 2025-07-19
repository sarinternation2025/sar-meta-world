import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect } from 'vitest';
import chatReducer from '../features/chat/chatSlice';
import { store } from '../app/store';

describe('Redux Store Integration', () => {
  it('should have the correct initial state', () => {
    const state = store.getState();
    expect(state.chat).toBeDefined();
    expect(state.chat.messages).toEqual([]);
    expect(state.chat.isConnected).toBe(false);
    expect(state.chat.inputMessage).toBe('');
  });

  it('should create store with chat reducer', () => {
    const testStore = configureStore({
      reducer: {
        chat: chatReducer,
      },
    });
    
    expect(testStore.getState().chat).toBeDefined();
    expect(testStore.getState().chat.messages).toEqual([]);
  });
});
