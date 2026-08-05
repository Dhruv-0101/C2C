import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../services/auth.api';
import { setCredentials } from '../../../store/slices/authSlice';

/**
 * Custom hook for User Login supporting 2FA challenge redirect & 2.5s success notification delay
 */
export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  const mutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (response) => {
      const { require2FA, mfaToken, user, accessToken } = response.data;

      // If 2FA is required, navigate to 2FA challenge screen
      if (require2FA) {
        setSuccessMessage('Two-Factor Authentication required. Redirecting...');
        setTimeout(() => {
          navigate('/verify-2fa', { state: { mfaToken }, replace: true });
        }, 2500);
        return;
      }

      // 1. Show Green Success Banner FIRST without updating Redux state yet
      setSuccessMessage('🎉 Logged in successfully! Preparing your brand workspace...');

      // 2. Wait 2.5 seconds (2500ms) for the user to see the success feedback
      setTimeout(() => {
        // Dispatch credentials to Redux & Navigate
        dispatch(setCredentials({ user, accessToken }));

        if (user?.isSuperAdmin) {
          navigate('/admin/dashboard', { replace: true });
        } else if (user?.isSubAdmin) {
          navigate('/subadmin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 2500);
    },
  });

  return { ...mutation, successMessage };
};
