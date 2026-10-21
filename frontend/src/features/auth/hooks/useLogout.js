import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/features/auth/api/auth.api';
import { logoutState } from '../../../store/slices/authSlice';

/**
 * Custom hook for User Logout
 */
export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch (err) {
        // Server session may already be dead or expired - proceeding with local cleanup
        console.warn('Backend logout failed, proceeding with local purge:', err);
      }
    },
    onSettled: () => {
      // Always purge state and clean up storage/queries
      dispatch(logoutState());
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};
