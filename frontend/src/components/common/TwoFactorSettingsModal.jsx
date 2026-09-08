import React from 'react';
import { ShieldCheck, QrCode, Copy, Check, Lock, AlertTriangle, Download } from 'lucide-react';
import { useTwoFactor } from '../../hooks/useTwoFactor';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

export const TwoFactorSettingsModal = ({ isOpen, onClose }) => {
  const {
    user,
    step,
    qrCodeUrl,
    secret,
    verifyCode,
    setVerifyCode,
    backupCodes,
    copied,
    isSettingUp,
    setupError,
    isEnabling,
    enableError,
    isDisabling,
    disableError,
    handleStartSetup,
    handleConfirmEnable,
    handleFinishSetup,
    handleCopyBackupCodes,
    handleDownloadBackupCodes,
    disable2FA,
  } = useTwoFactor(onClose);

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

            {disableError && (
              <Alert variant="error" message={disableError.message} />
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="danger"
                isLoading={isDisabling}
                onClick={() => disable2FA()}
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
                {setupError && (
                  <Alert variant="error" message={setupError.message} />
                )}
                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isSettingUp}
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
                    error={enableError?.message}
                  />

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isEnabling}
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
