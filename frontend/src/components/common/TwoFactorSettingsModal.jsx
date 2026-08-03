import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { ShieldCheck, QrCode, Key, Copy, Check, Lock, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { authApi } from '../../services/auth.api';
import { updateUser } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

export const TwoFactorSettingsModal = ({ isOpen, onClose }) => {
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
      setStep(2); // Transition to Backup Codes screen first before updating active status
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
      onClose();
    },
  });

  const handleStartSetup = () => {
    setupMutation.mutate();
  };

  const handleConfirmEnable = (e) => {
    e.preventDefault();
    if (!verifyCode) return;
    enableMutation.mutate(verifyCode);
  };

  const handleFinishSetup = () => {
    dispatch(updateUser({ isTwoFactorEnabled: true }));
    setStep(1);
    setQrCodeUrl('');
    setVerifyCode('');
    setBackupCodes([]);
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel max-w-lg w-full rounded-2xl p-6 border border-slate-800 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading font-bold text-lg text-white">
              Two-Factor Security (2FA)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Step 2: Display Backup Recovery Codes (Takes precedence immediately upon enabling 2FA) */}
        {step === 2 ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <p className="font-bold text-xs text-amber-200">
                  ⚠️ CRITICAL: Save These Recovery Codes Now!
                </p>
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  If you lose your phone, switch devices, or lose access to your authenticator app, these emergency backup codes are the <strong>ONLY WAY</strong> to regain access to your account. Copy or download them immediately and keep them in a safe place.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 text-center select-all">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="p-1.5 bg-slate-900/80 rounded border border-slate-800 tracking-wider">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={copied ? Check : Copy}
                  onClick={handleCopyBackupCodes}
                >
                  {copied ? 'Copied!' : 'Copy All'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={handleDownloadBackupCodes}
                >
                  Download .txt
                </Button>
              </div>

              <Button variant="primary" size="sm" onClick={handleFinishSetup}>
                I Have Saved These Codes
              </Button>
            </div>
          </div>
        ) : user?.isTwoFactorEnabled ? (
          /* Current Status: Enabled */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-emerald-200">2FA is Currently Active</p>
                <p className="text-xs text-emerald-300/80">
                  Your account is protected by Google Authenticator / Authy app TOTP codes.
                </p>
              </div>
            </div>

            {disableMutation.error && (
              <Alert variant="error" message={disableMutation.error.message} />
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="danger"
                isLoading={disableMutation.isPending}
                onClick={() => disableMutation.mutate()}
              >
                Disable 2FA Security
              </Button>
            </div>
          </div>
        ) : (
          /* Current Status: Disabled / Setup Flow */
          <div className="space-y-5">
            {!qrCodeUrl && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-white">Enhance Your Account Security</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Protect your brand assets and account credentials by linking an Authenticator app (Google Authenticator, Authy, or 1Password).
                  </p>
                </div>
                {setupMutation.error && (
                  <Alert variant="error" message={setupMutation.error.message} />
                )}
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={setupMutation.isPending}
                  icon={QrCode}
                  onClick={handleStartSetup}
                  className="w-full"
                >
                  Scan QR Code & Begin Setup
                </Button>
              </div>
            )}

            {/* Step 1: Display QR Code & Secret */}
            {qrCodeUrl && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  1. Open Google Authenticator or Authy on your phone and scan the QR code:
                </p>
                <div className="bg-white p-3 rounded-xl w-44 h-44 mx-auto flex items-center justify-center border-2 border-amber-500/50 shadow-glow">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-full h-full object-contain" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Manual Secret Key</p>
                  <code className="text-xs font-mono text-amber-400 bg-slate-900 px-3 py-1 rounded-md border border-slate-800 select-all inline-block">
                    {secret}
                  </code>
                </div>

                <form onSubmit={handleConfirmEnable} className="space-y-3 pt-2">
                  <Input
                    label="2. Enter 6-Digit Code from Authenticator App"
                    placeholder="123456"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    maxLength={6}
                    error={enableMutation.error?.message}
                  />

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={enableMutation.isPending}
                      isDisabled={verifyCode.length < 6}
                      icon={ShieldCheck}
                    >
                      Verify & Activate 2FA
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSettingsModal;
