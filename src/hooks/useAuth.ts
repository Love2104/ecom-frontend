import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { login as loginAction, logout as logoutAction, updateUser as updateUserAction } from '@/store/authSlice';
import useApi from './useApi';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  message?: string;
}

export function useAuth() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);
  
  const loginApi = useApi<AuthResponse>();
  const registerApi = useApi<AuthResponse>();
  const profileApi = useApi<AuthResponse>({ requireAuth: true });
  const updateProfileApi = useApi<AuthResponse>({ requireAuth: true });

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginApi.fetchData({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      });

      if (response && response.success && response.token) {
        dispatch(loginAction({
          token: response.token,
          user: response.user!
        }));
        return { success: true };
      }
      
      return { 
        success: false, 
        error: loginApi.error || response?.message || 'Login failed' 
      };
    },
    [dispatch, loginApi]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const response = await registerApi.fetchData({
        url: '/auth/register',
        method: 'POST',
        body: data
      });

      if (response && response.success) {
        return { success: true, message: response.message || 'Registration successful' };
      }
      
      return { 
        success: false, 
        error: registerApi.error || response?.message || 'Registration failed' 
      };
    },
    [registerApi]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
    return { success: true };
  }, [dispatch]);

  const getProfile = useCallback(async () => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };
    
    const response = await profileApi.fetchData({
      url: '/auth/me',
      requireAuth: true
    });
    
    if (response && response.success && response.user) {
      dispatch(updateUserAction(response.user));
      return { success: true, user: response.user };
    }
    
    return { 
      success: false, 
      error: profileApi.error || response?.message || 'Failed to fetch profile' 
    };
  }, [isAuthenticated, profileApi, dispatch]);

  const updateProfile = useCallback(async (data: Partial<RegisterData> & { currentPassword?: string }) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };
    
    const response = await updateProfileApi.fetchData({
      url: '/auth/profile',
      method: 'PUT',
      body: data,
      requireAuth: true
    });
    
    if (response && response.success && response.user) {
      dispatch(updateUserAction(response.user));
      return { success: true, user: response.user };
    }
    
    return { 
      success: false, 
      error: updateProfileApi.error || response?.message || 'Failed to update profile' 
    };
  }, [isAuthenticated, updateProfileApi, dispatch]);

  return {
    isAuthenticated,
    user,
    token,
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    loginLoading: loginApi.loading,
    loginError: loginApi.error,
    registerLoading: registerApi.loading,
    registerError: registerApi.error,
    profileLoading: profileApi.loading,
    profileError: profileApi.error,
    updateProfileLoading: updateProfileApi.loading,
    updateProfileError: updateProfileApi.error
  };
}

export default useAuth;