import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../services/auth.api';
import { setCredentials } from '../../../store/slices/authSlice';
import { USER_ROLES } from '../../../constants/theme.constants';

/**
 * Custom hook for User Registration using TanStack Query & 2.5s success notification delay
 */
export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  const mutation = useMutation({
    mutationFn: (userData) => {
      // Omit confirmPassword before sending to API
      const { confirmPassword, ...payload } = userData;
      return authApi.signup(payload);
    },
    onSuccess: (response) => {
      const { user, accessToken } = response.data;

      // 1. Show Green Success Banner FIRST without updating Redux state yet
      setSuccessMessage('🎉 Account registered successfully! Preparing your brand workspace...');

      // 2. Wait 2.5 seconds (2500ms) for the user to see the success feedback
      setTimeout(() => {
        // Dispatch credentials to Redux & Navigate
        dispatch(setCredentials({ user, accessToken }));

        if (user?.role === USER_ROLES.ADMIN) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 2500);
    },
  });

  return { ...mutation, successMessage };
};
