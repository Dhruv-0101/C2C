import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { ShieldCheck, ArrowLeft, Lock, LifeBuoy } from 'lucide-react';
import { authApi } from '../../../services/auth.api';
import { setCredentials } from '../../../store/slices/authSlice';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';

export const TwoFactorVerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const mfaToken = location.state?.mfaToken;
  const [isBackupMode, setIsBackupMode] = useState(false);

  // Length for input slots: 8 for Backup Code, 6 for TOTP
  const codeLength = isBackupMode ? 8 : 6;
  const [codeSlots, setCodeSlots] = useState(Array(codeLength).fill(''));
  const inputRefs = useRef([]);

  // Reset slots when toggling mode
  useEffect(() => {
    setCodeSlots(Array(codeLength).fill(''));
    inputRefs.current = inputRefs.current.slice(0, codeLength);
    // Auto-focus first box
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [isBackupMode, codeLength]);

  const verifyMutation = useMutation({
    mutationFn: (payload) => authApi.verifyLogin2FA(payload),
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      dispatch(setCredentials({ user, accessToken }));

      if (user?.isSuperAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.isSubAdmin) {
        navigate('/subadmin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    },
  });

  const fullCode = codeSlots.join('');

  const handleInputChange = (index, value) => {
    const val = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!val && value !== '') return;

    const newSlots = [...codeSlots];
    newSlots[index] = val.slice(-1); // Take last character entered
    setCodeSlots(newSlots);

    // Auto-advance to next box if character typed
    if (val && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!codeSlots[index] && index > 0) {
        // Move back and clear previous box
        inputRefs.current[index - 1]?.focus();
        const newSlots = [...codeSlots];
        newSlots[index - 1] = '';
        setCodeSlots(newSlots);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    if (!pastedText) return;

    const newSlots = [...codeSlots];
    for (let i = 0; i < codeLength; i++) {
      if (pastedText[i]) {
        newSlots[i] = pastedText[i];
      }
    }
    setCodeSlots(newSlots);

    // Focus last filled box or last overall box
    const focusIndex = Math.min(pastedText.length, codeLength - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (fullCode.length < codeLength || !mfaToken) return;

    verifyMutation.mutate({
      mfaToken,
      code: fullCode,
    });
  };

  if (!mfaToken) {
    return (
      <Card className="max-w-md mx-auto text-center space-y-4 border-[#2C384E] bg-[#131B2A]">
        <Lock className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="font-heading font-bold text-xl text-white">2FA Session Expired</h2>
        <p className="text-xs text-slate-400">
          Your 2FA login session has expired or is invalid. Please sign in again.
        </p>
        <Link to="/login">
          <Button variant="primary" className="w-full">
            Return to Sign In
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto border-[#2C384E] bg-[#131B2A] shadow-2xl">
      <div className="space-y-6">
        {/* Header Badge */}
        <div className="space-y-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-500/10 to-teal-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-glow">
            {isBackupMode ? <LifeBuoy className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
            {isBackupMode ? 'Emergency Backup Verification' : 'Two-Factor Verification'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {isBackupMode
              ? 'Enter one of your 8-character single-use emergency recovery codes below.'
              : 'Open your Authenticator app (Google Authenticator / Authy) and enter your 6-digit TOTP code.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setIsBackupMode(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isBackupMode
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📱 6-Digit Authenticator
          </button>
          <button
            type="button"
            onClick={() => setIsBackupMode(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isBackupMode
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔑 8-Character Backup Code
          </button>
        </div>

        {/* Error Alert */}
        {verifyMutation.error && (
          <Alert
            variant="error"
            title="Verification Failed"
            message={
              verifyMutation.error.message ||
              (isBackupMode
                ? 'Invalid or previously used 8-character backup code.'
                : 'Invalid 6-digit authenticator code.')
            }
          />
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* Label */}
          <div className="text-center">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {isBackupMode ? 'Enter 8-Character Recovery Code' : 'Enter 6-Digit Verification Code'}
            </span>
          </div>

          {/* Individual Code Box Grid */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
            {codeSlots.map((char, index) => (
              <React.Fragment key={index}>
                {/* Visual Separator Dash for 8-char Backup Mode (after 4th char) */}
                {isBackupMode && index === 4 && (
                  <span className="text-slate-500 font-bold text-lg px-0.5">-</span>
                )}

                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={char}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-mono font-bold uppercase rounded-xl border transition-all outline-none ${
                    char
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-glow'
                      : 'border-slate-700 bg-slate-950 text-white focus:border-amber-500 focus:bg-slate-900'
                  }`}
                />
              </React.Fragment>
            ))}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={verifyMutation.isPending}
            isDisabled={fullCode.length < codeLength}
            className="w-full font-bold tracking-wide"
          >
            {isBackupMode ? 'Verify Backup Code & Sign In' : 'Verify & Continue'}
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500">
            {isBackupMode ? '⚠️ Single-use code' : '🔒 Time-sensitive TOTP code'}
          </span>

          <Link to="/login" className="text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default TwoFactorVerifyPage;
