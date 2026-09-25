import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMobileSidebarOpen: false,
  isSidebarCollapsed: false,
  activeModal: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileSidebar: (state) => {
      state.isMobileSidebarOpen = !state.isMobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action) => {
      state.isMobileSidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
  },
});

export const {
  toggleMobileSidebar,
  setMobileSidebarOpen,
  toggleSidebarCollapsed,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
