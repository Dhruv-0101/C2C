import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/features/auth/api/auth.api';
import { setCredentials } from '../../../store/slices/authSlice';
import { USER_ROLES } from '@/shared/constants';

/**
 * Custom hook for User Registration with 4-Digit Email OTP Verification
 * Handles two-step flow: OTP dispatch via Redis queue -> 4-digit code verification -> session creation
 */
export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [devOtp, setDevOtp] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendSuccessMessage, setResendSuccessMessage] = useState('');

  // 1. Send 4-digit OTP Mutation (Fast < 5ms Redis backed endpoint)
  const sendOtpMutation = useMutation({
    mutationFn: (payload) => authApi.sendRegistrationOtp(payload),
    onSuccess: (response) => {
      setIsOtpModalOpen(true);
      const otpCode = response?.data?.devOtp || response?.data?.data?.devOtp || response?.devOtp;
      if (otpCode) {
        setDevOtp(String(otpCode));
      }
      setResendSuccessMessage(response?.data?.message || response?.message || 'Verification code sent to your email.');
      setTimeout(() => setResendSuccessMessage(''), 5000);
    },
  });

  // 2. Complete Account Registration Mutation (Verifies OTP)
  const registerMutation = useMutation({
    mutationFn: (userData) => {
      // Omit confirmPassword before sending to API
      const { confirmPassword, ...payload } = userData;
      return authApi.signup(payload);
    },
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      setIsOtpModalOpen(false);

      // Set just_authenticated so Welcome Modal triggers on dashboard
      sessionStorage.setItem("just_authenticated", "register");

      // 1. Show Green Success Banner FIRST without updating Redux state yet
      setSuccessMessage('🎉 Account registered successfully! Preparing your brand workspace...');

      // 2. Wait 2.5 seconds (2500ms) for the user to see the success feedback
      setTimeout(() => {
        dispatch(setCredentials({ user, accessToken }));

        if (user?.role === USER_ROLES.ADMIN) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 2500);
    },
  });

  // Start registration: sends OTP to email and opens verification modal
  const initiateRegistration = (formData) => {
    setPendingData(formData);
    sendOtpMutation.mutate({
      email: formData.email,
      fullName: formData.fullName,
    });
  };

  // Verify entered 4-digit code and create user account
  const verifyAndRegister = (otp) => {
    if (!pendingData) return;
    registerMutation.mutate({
      ...pendingData,
      otp,
    });
  };

  // Resend 4-digit code with 120s cooldown
  const resendOtp = () => {
    if (!pendingData?.email) return Promise.resolve();
    return sendOtpMutation.mutateAsync({
      email: pendingData.email,
      fullName: pendingData.fullName,
    });
  };

  const closeOtpModal = () => {
    setIsOtpModalOpen(false);
  };

  return {
    initiateRegistration,
    verifyAndRegister,
    resendOtp,
    closeOtpModal,
    isOtpModalOpen,
    pendingEmail: pendingData?.email || '',
    isSendingOtp: sendOtpMutation.isPending,
    isRegistering: registerMutation.isPending,
    sendOtpError: sendOtpMutation.error,
    registerError: registerMutation.error,
    resendSuccessMessage,
    successMessage,
    devOtp,
    // Backward-compatibility properties
    isPending: sendOtpMutation.isPending || registerMutation.isPending,
    error: sendOtpMutation.error || registerMutation.error,
    mutate: initiateRegistration,
  };
};
