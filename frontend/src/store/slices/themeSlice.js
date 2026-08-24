import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('brandflow_theme');
  if (saved) return saved;
  return 'dark';
};

const initialTheme = getInitialTheme();

// Set initial DOM class on load
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(initialTheme);
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme,
  },
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = nextTheme;
      localStorage.setItem('brandflow_theme', nextTheme);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(nextTheme);
      }
    },
    setTheme: (state, action) => {
      const newTheme = action.payload;
      state.mode = newTheme;
      localStorage.setItem('brandflow_theme', newTheme);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(newTheme);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
