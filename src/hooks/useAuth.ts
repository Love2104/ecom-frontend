import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { login as loginAction, logout as logoutAction, updateUser as updateUserAction } from '@/store/authSlice';
import useApi from './useApi';
import { User } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface ManagerLoginCredentials {
  key_code: string;
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
  user?: User;
  message?: string;
}

export function useAuth() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);

  const loginApi = useApi<AuthResponse>();
  const registerApi = useApi<AuthResponse>();
  const profileApi = useApi<AuthResponse>({ requireAuth: true });
  const updateProfileApi = useApi<AuthResponse>({ requireAuth: true });
  const managerLoginApi = useApi<AuthResponse>();
  const verifyOtpApi = useApi<AuthResponse>();
  const resendOtpApi = useApi<AuthResponse>();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginApi.fetchData({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      });

      if (response && response.success && response.token && response.user) {
        dispatch(loginAction({
          token: response.token,
          user: response.user
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

  const managerLogin = useCallback(
    async (credentials: ManagerLoginCredentials) => {
      const response = await managerLoginApi.fetchData({
        url: '/auth/manager/login',
        method: 'POST',
        body: credentials
      });

      if (response && response.success && response.token && response.user) {
        dispatch(loginAction({
          token: response.token,
          user: response.user
        }));
        return { success: true };
      }

      return {
        success: false,
        error: managerLoginApi.error || response?.message || 'Manager login failed'
      };
    },
    [dispatch, managerLoginApi]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const response = await registerApi.fetchData({
        url: '/auth/register',
        method: 'POST',
        body: data
      });

      if (response && response.success) {
        return { success: true, message: response.message || 'Registration successful. Please verify OTP.' };
      }

      return {
        success: false,
        error: registerApi.error || response?.message || 'Registration failed'
      };
    },
    [registerApi]
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      const response = await verifyOtpApi.fetchData({
        url: '/auth/verify-otp',
        method: 'POST',
        body: { email, otp }
      });

      if (response && response.success && response.token && response.user) {
        dispatch(loginAction({
          token: response.token,
          user: response.user
        }));
        return { success: true };
      }
      return { success: false, error: verifyOtpApi.error || response?.message || 'Verification failed' };
    },
    [verifyOtpApi, dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
    return { success: true };
  }, [dispatch]);

  const resendOtp = useCallback(
    async (email: string) => {
      const response = await resendOtpApi.fetchData({
        url: '/auth/resend-otp',
        method: 'POST',
        body: { email }
      });
      if (response && response.success) {
        return { success: true };
      }
      return { success: false, error: resendOtpApi.error || response?.message || 'Failed to resend OTP' };
    },
    [resendOtpApi]
  );

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

  const requestSupplierStatus = useCallback(async (data: { business_name: string; gst_number: string }) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

    const response = await updateProfileApi.fetchData({
      url: '/auth/request-supplier',
      method: 'POST',
      body: data,
      requireAuth: true
    });

    if (response && response.success && response.user) {
      dispatch(updateUserAction(response.user));
      return { success: true, user: response.user };
    }

    return {
      success: false,
      error: updateProfileApi.error || response?.message || 'Failed to submit request'
    };
  }, [isAuthenticated, updateProfileApi, dispatch]);

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
    managerLogin,
    register,
    verifyOtp,
    resendOtp,
    logout,
    getProfile,
    updateProfile,
    requestSupplierStatus,
    loginLoading: loginApi.loading || managerLoginApi.loading,
    loginError: loginApi.error || managerLoginApi.error,
    registerLoading: registerApi.loading,
    registerError: registerApi.error,
    profileLoading: profileApi.loading,
    updateProfileLoading: updateProfileApi.loading,
    updateProfileError: updateProfileApi.error,
    resendOtpLoading: resendOtpApi.loading,
  };
}

export default useAuth;