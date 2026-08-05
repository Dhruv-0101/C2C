import { useState, useCallback } from 'react';

/**
 * Reusable Custom Hook for Triggering Feedback Modals (DRY Principle)
 * Standardizes operation popups across all Admin and SMB modules.
 */
export const useFeedbackModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    actionLabel: '',
    onAction: null,
  });

  const showSuccess = useCallback((title, message, actionLabel, onAction) => {
    setModalState({
      isOpen: true,
      type: 'success',
      title,
      message,
      actionLabel: actionLabel || 'Great, Got it!',
      onAction: onAction || null,
    });
  }, []);

  const showError = useCallback((title, message, actionLabel, onAction) => {
    setModalState({
      isOpen: true,
      type: 'error',
      title,
      message,
      actionLabel: actionLabel || 'Understand',
      onAction: onAction || null,
    });
  }, []);

  const showWarning = useCallback((title, message, actionLabel, onAction) => {
    setModalState({
      isOpen: true,
      type: 'warning',
      title,
      message,
      actionLabel: actionLabel || 'Proceed',
      onAction: onAction || null,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modalProps: {
      isOpen: modalState.isOpen,
      type: modalState.type,
      title: modalState.title,
      message: modalState.message,
      actionLabel: modalState.actionLabel,
      onClose: closeModal,
      onAction: modalState.onAction,
    },
    showSuccess,
    showError,
    showWarning,
    closeModal,
  };
};
