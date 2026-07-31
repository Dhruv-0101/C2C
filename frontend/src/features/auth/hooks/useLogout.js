import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../services/auth.api';
import { logoutState } from '../../../store/slices/authSlice';

/**
 * Custom hook for User Logout
 */
export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Always purge state even if server logout request fails
      dispatch(logoutState());
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};
