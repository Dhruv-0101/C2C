import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../services/auth.api';
import { setCredentials } from '../../../store/slices/authSlice';
import { USER_ROLES } from '../../../constants/theme.constants';

/**
 * Custom hook for User Registration using TanStack Query
 */
export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userData) => {
      // Omit confirmPassword before sending to API
      const { confirmPassword, ...payload } = userData;
      return authApi.signup(payload);
    },
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      
      // Dispatch credentials to Redux store
      dispatch(setCredentials({ user, accessToken }));

      // Redirect based on User Role
      if (user?.role === USER_ROLES.ADMIN) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    },
  });
};
