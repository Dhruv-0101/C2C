import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { ShieldCheck, QrCode, Key, Copy, Check, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
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
      dispatch(updateUser({ isTwoFactorEnabled: true }));
      setStep(2);
    },
  });

  // Disable 2FA Mutation
  const disableMutation = useMutation({
    mutationFn: () => authApi.disable2FA(),
    onSuccess: () => {
      dispatch(updateUser({ isTwoFactorEnabled: false }));
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

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Current Status: Enabled */}
        {user?.isTwoFactorEnabled ? (
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
            {step === 1 && !qrCodeUrl && (
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
            {step === 1 && qrCodeUrl && (
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

            {/* Step 2: Display Backup Recovery Codes */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-xs text-amber-200">Save Your Backup Recovery Codes</p>
                    <p className="text-[11px] text-amber-300/80">
                      If you lose access to your phone or authenticator app, these single-use recovery codes are the ONLY way to regain access to your account.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 text-center">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="p-1.5 bg-slate-900/80 rounded border border-slate-800">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                    onClick={handleCopyBackupCodes}
                  >
                    {copied ? 'Copied Codes!' : 'Copy All Codes'}
                  </Button>

                  <Button variant="primary" size="sm" onClick={onClose}>
                    Done & Saved
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSettingsModal;
