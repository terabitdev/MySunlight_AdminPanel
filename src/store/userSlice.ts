import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  profileImageUrl?: string;
  isActive: boolean;
  selectedPlan?: string;
  createdAt: any;
  emailVerified: boolean;
  username?: string;
  signInMethod?: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

// Async thunk to fetch users from Firestore
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);

      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Filter out admin users
        if (data.type === 'Admin') {
          return;
        }

        users.push({
          uid: data.uid || doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          profileImageUrl: data.profileImageUrl || '',
          isActive: data.isActive ?? true,
          selectedPlan: data.selectedPlan || '',
          createdAt: data.createdAt,
          emailVerified: data.emailVerified ?? false,
          username: data.username || '',
          signInMethod: data.signInMethod || '',
        });
      });

      return users;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
