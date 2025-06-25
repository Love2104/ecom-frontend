import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { safeJsonParse } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Check for saved user data in localStorage
const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: savedUser ? safeJsonParse(savedUser, null) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
};

interface LoginPayload {
  user: User;
  token: string;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;