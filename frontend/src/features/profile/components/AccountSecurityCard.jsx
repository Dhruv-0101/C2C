import React from 'react';
import { Shield, Key, Check, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

/**
 * AccountSecurityCard
 * Password change & 2FA toggle card
 */
export const AccountSecurityCard = ({
  profile = {},
  onOpen2FA,
  onChangePassword,
}) => {
  return (
    <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-4">
      <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
        <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Security & Authentication</span>
        </h3>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Enterprise Security
        </span>
      </div>

      <div className="space-y-4 text-xs">
        {/* Authentication Mode */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <p className="font-semibold text-slate-200">Sign-in Method</p>
            <p className="text-[11px] text-slate-400">Primary login credential provider</p>
          </div>
          <div>
            {profile.isGoogleRegistered ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Google OAuth
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                Email & Password
              </span>
            )}
          </div>
        </div>

        {/* Two-Factor Authentication Status & Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-slate-200">Two-Factor Authentication (2FA)</p>
              {profile.isTwoFactorEnabled ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400">TOTP Authenticator app verification</p>
          </div>

          <Button
            type="button"
            size="sm"
            variant={profile.isTwoFactorEnabled ? "outline" : "primary"}
            onClick={onOpen2FA}
            className={`text-xs font-bold ${
              profile.isTwoFactorEnabled
                ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {profile.isTwoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
          </Button>
        </div>

        {/* Security Recommendations */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-[11px] space-y-1">
          <p className="font-semibold text-slate-300">Security Recommendation</p>
          <p>
            Keep two-factor authentication enabled to safeguard your brand assets and automated publishing tokens.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default AccountSecurityCard;
