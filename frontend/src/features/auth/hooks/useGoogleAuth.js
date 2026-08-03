import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../services/auth.api';
import { setCredentials } from '../../../store/slices/authSlice';

/**
 * Custom hook for Google OAuth 2.0 Login / Signup
 */
export const useGoogleAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload) => authApi.googleLogin(payload),
    onSuccess: (response) => {
      const { require2FA, mfaToken, user, accessToken } = response.data;

      // If 2FA is required, navigate to 2FA challenge screen
      if (require2FA) {
        navigate('/verify-2fa', { state: { mfaToken }, replace: true });
        return;
      }

      // Dispatch credentials to Redux store
      dispatch(setCredentials({ user, accessToken }));

      // Redirect based on User Role & Admin Flags
      if (user?.isSuperAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.isSubAdmin) {
        navigate('/subadmin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    },
  });
};
