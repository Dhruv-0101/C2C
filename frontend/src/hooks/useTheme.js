import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setTheme } from '../store/slices/themeSlice';

/**
 * Custom hook for accessing and toggling global dark/light theme mode
 */
export const useTheme = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme?.mode || 'dark');

  return {
    mode,
    isDark: mode === 'dark',
    isLight: mode === 'light',
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (newMode) => dispatch(setTheme(newMode)),
  };
};
