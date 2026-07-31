import { useSelector } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsSuperAdmin,
  selectIsSubAdmin,
  selectAllowedTabs,
  selectAccessToken,
} from '../store/slices/authSlice';

/**
 * Hook to access authentication state and role flags
 */
export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const isAdmin = useSelector(selectIsAdmin);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const isSubAdmin = useSelector(selectIsSubAdmin);
  const allowedTabs = useSelector(selectAllowedTabs);

  return {
    user,
    isAuthenticated,
    accessToken,
    isAdmin,
    isSuperAdmin,
    isSubAdmin,
    allowedTabs,
    isEndUser: !isAdmin,
  };
};
