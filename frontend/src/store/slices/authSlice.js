import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../constants/theme.constants';
import { storage } from '../../utils/storage.util';

// Hydrate state from localStorage on load
const initialUser = storage.get(STORAGE_KEYS.USER_DATA);
const initialAccessToken = storage.get(STORAGE_KEYS.ACCESS_TOKEN);

const initialState = {
  user: initialUser || null,
  accessToken: initialAccessToken || null,
  isAuthenticated: Boolean(initialAccessToken && initialUser),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;

      // Sync to local storage
      storage.set(STORAGE_KEYS.USER_DATA, user);
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      storage.set(STORAGE_KEYS.USER_DATA, state.user);
    },
    logoutState: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      // Clear local storage tokens
      storage.remove(STORAGE_KEYS.USER_DATA);
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    },
  },
});

export const { setCredentials, updateUser, logoutState } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsSuperAdmin = (state) =>
  Boolean(
    state.auth.user?.isSuperAdmin ||
    state.auth.user?.role === "ADMIN" ||
    state.auth.user?.role === "SUPER_ADMIN"
  );
export const selectIsSubAdmin = (state) =>
  Boolean(
    state.auth.user?.isSubAdmin ||
    state.auth.user?.role === "SUBADMIN" ||
    state.auth.user?.role === "SUB_ADMIN"
  );
export const selectIsAdmin = (state) =>
  selectIsSuperAdmin(state) || selectIsSubAdmin(state) || Boolean(state.auth.user?.isAdmin);
export const selectAllowedTabs = (state) => state.auth.user?.allowedTabs || [];

export default authSlice.reducer;
