import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { authApi } from '../services/auth.api';
import { updateUser } from '../store/slices/authSlice';
import { useAuth } from './useAuth';

/**
 * Custom Hook for Two-Factor Authentication (2FA) setup & management
 */
export function useTwoFactor(onClose) {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1); // 1: Setup QR, 2: Backup Codes, 3: Success/Status
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [copied, setCopied] = useState(false);

  // Setup 2FA Mutation
  const setupMutation = useMutation({
    mutationFn: () => authApi.setup2FA(),
    onSuccess: (res) => {
      setQrCodeUrl(res.data.qrCodeUrl);
      setSecret(res.data.secret);
      setStep(1);
    },
  });

  // Enable 2FA Mutation
  const enableMutation = useMutation({
    mutationFn: (code) => authApi.enable2FA({ code }),
    onSuccess: (res) => {
      setBackupCodes(res.data.backupCodes || []);
      setStep(2);
    },
  });

  // Disable 2FA Mutation
  const disableMutation = useMutation({
    mutationFn: () => authApi.disable2FA(),
    onSuccess: () => {
      dispatch(updateUser({ isTwoFactorEnabled: false }));
      setStep(1);
      setQrCodeUrl('');
      setVerifyCode('');
      setBackupCodes([]);
      if (onClose) onClose();
    },
  });

  const handleStartSetup = () => {
    setupMutation.mutate();
  };

  const handleConfirmEnable = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!verifyCode) return;
    enableMutation.mutate(verifyCode);
  };

  const handleFinishSetup = () => {
    dispatch(updateUser({ isTwoFactorEnabled: true }));
    setStep(1);
    setQrCodeUrl('');
    setVerifyCode('');
    setBackupCodes([]);
    if (onClose) onClose();
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const textContent =
      `==========================================\n` +
      `BRANDFLOW 2FA EMERGENCY BACKUP CODES\n` +
      `==========================================\n` +
      `Generated: ${new Date().toLocaleString()}\n` +
      `User Email: ${user?.email || 'Account'}\n\n` +
      `RECOVERY CODES:\n` +
      backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n') +
      `\n\n` +
      `⚠️ WARNING:\n` +
      `If you lose your phone, change devices, or lose access to your authenticator app,\n` +
      `these single-use backup codes are the ONLY way to log into your account.\n` +
      `Keep this file safe and secure.\n`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brandflow-backup-codes-${user?.email || 'user'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    user,
    step,
    setStep,
    qrCodeUrl,
    secret,
    verifyCode,
    setVerifyCode,
    backupCodes,
    copied,
    isSettingUp: setupMutation.isPending,
    setupError: setupMutation.error,
    isEnabling: enableMutation.isPending,
    enableError: enableMutation.error,
    isDisabling: disableMutation.isPending,
    disableError: disableMutation.error,
    handleStartSetup,
    handleConfirmEnable,
    handleFinishSetup,
    handleCopyBackupCodes,
    handleDownloadBackupCodes,
    disable2FA: disableMutation.mutate,
  };
}
