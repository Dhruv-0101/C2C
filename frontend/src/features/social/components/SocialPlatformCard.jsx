import React from 'react';
import { CheckCircle, AlertCircle, Link2, Unlink, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

/**
 * SocialPlatformCard
 * Facebook, Instagram, LinkedIn status and connection card
 */
export const SocialPlatformCard = ({
  icon: Icon,
  iconBg = 'bg-indigo-600',
  title,
  description,
  account,
  accountUrl,
  subtext,
  isConnected = false,
  isConnecting = false,
  isDisconnecting = false,
  onConnect,
  onDisconnect,
  connectLabel = 'Connect Account',
  disconnectLabel = 'Disconnect',
  connectBtnClass = '',
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#2C384E] flex flex-col md:flex-row md:items-center justify-between gap-5 transition hover:border-[#3d4d6b]">
      <div className="flex items-start gap-4">
        <div className={`p-3.5 rounded-2xl text-white shadow-glow ${iconBg}`}>
          <Icon className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base text-white">{title}</h4>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Not Connected</span>
              </span>
            )}
          </div>

          {isConnected && account ? (
            <div className="space-y-0.5 text-xs text-slate-300">
              {accountUrl ? (
                <a
                  href={accountUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-400 text-sm hover:text-amber-300 hover:underline transition group"
                  title="View Profile"
                >
                  <span>{account.accountName || account.username || account.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition" />
                </a>
              ) : (
                <span className="font-mono font-bold text-slate-200">
                  {account.accountName || account.username || account.name}
                </span>
              )}
              {subtext && (
                <p className="text-[11px] text-slate-400">{subtext}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-end gap-2">
        {isConnected ? (
          <Button
            variant="outline"
            className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs justify-center"
            isLoading={isDisconnecting}
            onClick={onDisconnect}
            icon={Unlink}
          >
            {disconnectLabel}
          </Button>
        ) : (
          <Button
            variant="primary"
            className={`text-white font-bold text-xs justify-center shadow-lg ${connectBtnClass}`}
            isLoading={isConnecting}
            onClick={onConnect}
            icon={Link2}
          >
            {connectLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SocialPlatformCard;
