import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import notificationsReducer from './notificationsSlice';

export const store = configureStore({
  reducer: {
    users: userReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['users/fetchUsers/fulfilled', 'notifications/fetchFlaggedNotifications/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'meta.arg.createdAt'],
        // Ignore these paths in the state
        ignoredPaths: ['users.users', 'notifications.notifications'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
