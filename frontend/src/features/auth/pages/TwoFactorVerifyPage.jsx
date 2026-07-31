import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { ShieldCheck, KeyRound, ArrowLeft, Lock } from 'lucide-react';
import { authApi } from '../../../services/auth.api';
import { setCredentials } from '../../../store/slices/authSlice';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';

export const TwoFactorVerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const mfaToken = location.state?.mfaToken;
  const [code, setCode] = useState('');
  const [isBackupMode, setIsBackupMode] = useState(false);

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

  const handleVerify = (e) => {
    e.preventDefault();
    if (!code || !mfaToken) return;

    verifyMutation.mutate({
      mfaToken,
      code,
    });
  };

  if (!mfaToken) {
    return (
      <Card className="max-w-md mx-auto text-center space-y-4">
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
    <Card className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-teal-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
            Two-Factor Verification
          </h2>
          <p className="text-xs text-slate-400">
            {isBackupMode
              ? 'Enter one of your single-use backup recovery codes.'
              : 'Open your Google Authenticator or Authy app and enter the 6-digit code.'}
          </p>
        </div>

        {verifyMutation.error && (
          <Alert
            variant="error"
            title="Verification Failed"
            message={verifyMutation.error.message || 'Invalid 6-digit code or backup code.'}
          />
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label={isBackupMode ? '8-Character Backup Code' : '6-Digit Authenticator Code'}
            id="2fa-code"
            type="text"
            placeholder={isBackupMode ? 'e.g. A1B2C3D4' : '123456'}
            icon={KeyRound}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={isBackupMode ? 10 : 6}
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={verifyMutation.isPending}
            isDisabled={!code.trim()}
            className="w-full"
          >
            Verify & Continue
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsBackupMode((prev) => !prev);
              setCode('');
            }}
            className="text-amber-400 hover:underline font-semibold"
          >
            {isBackupMode ? 'Use Authenticator App 6-digit code' : 'Use a Backup Code'}
          </button>

          <Link to="/login" className="text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default TwoFactorVerifyPage;
