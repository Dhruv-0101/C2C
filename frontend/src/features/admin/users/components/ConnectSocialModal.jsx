import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Facebook, Instagram, Share2, ShieldCheck, CheckCircle2, AlertCircle, Key, ExternalLink } from 'lucide-react';

const connectSocialSchema = z.object({
  token: z
    .string()
    .min(20, 'Meta System User / Page Token must be at least 20 characters')
    .trim(),
});

/**
 * ConnectSocialModal Component
 * Enterprise Agency Onboarding dialog for Admins to link permanent Meta System User Tokens
 * to a specific tenant client, automatically binding Facebook Page & Instagram Business profile.
 */
export const ConnectSocialModal = ({
  isOpen,
  onClose,
  user,
  onConfirm,
  isPending,
}) => {
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(connectSocialSchema),
    defaultValues: {
      token: '',
    },
  });

  const handleClose = () => {
    reset();
    setFormError(null);
    onClose();
  };

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      if (onConfirm && user) {
        await onConfirm({ userId: user.id, token: values.token });
        handleClose();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to verify and link Meta token.');
    }
  };

  if (!user) return null;

  const existingFb = user.socialAccounts?.find((a) => a.platform === 'FACEBOOK' && a.isConnected);
  const existingIg = user.socialAccounts?.find((a) => a.platform === 'INSTAGRAM' && a.isConnected);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Link Meta Accounts (Agency Token)"
      description={`Connect Facebook Page & Instagram profile for tenant: ${user.fullName || user.email}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {/* Client Tenant Summary Header */}
        <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div>
              <span className="font-bold text-white block text-sm">{user.fullName || 'Client User'}</span>
              <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
            </div>
          </div>
          {user.brandKit?.businessName && (
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
              {user.brandKit.businessName}
            </span>
          )}
        </div>

        {/* Existing Accounts Pill Bar */}
        <div>
          <label className="block text-slate-300 font-bold mb-1.5">
            Current Social Status:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {existingFb ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 font-medium text-[11px]">
                <Facebook className="w-3.5 h-3.5 text-blue-400" />
                <span>{existingFb.accountName}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 text-slate-500 border border-slate-700/60 text-[10px]">
                <Facebook className="w-3 h-3" /> No Facebook Page
              </span>
            )}

            {existingIg ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium text-[11px]">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>{existingIg.accountName}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 text-slate-500 border border-slate-700/60 text-[10px]">
                <Instagram className="w-3 h-3" /> No Instagram Account
              </span>
            )}
          </div>
        </div>

        {/* Informative Guidance Banner */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-200">Agency Meta Integration Workflow</p>
            <p className="text-slate-300 text-[10px] mt-0.5">
              Paste the permanent <strong>System User Token</strong> generated from Meta Business Suite. BrandFlow will auto-verify the token, identify the assigned Facebook Page, detect its linked Instagram profile, and bind both directly to this user.
            </p>
          </div>
        </div>

        {/* Token Input Area */}
        <div>
          <label className="block text-slate-200 font-bold mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Meta System User / Page Access Token</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Starts with EAAP...</span>
          </label>
          <textarea
            rows={3}
            {...register('token')}
            placeholder="Paste permanent Meta System User token (EAAPOP...)"
            className="w-full rounded-xl bg-[#0B0F17] border border-[#2C384E] p-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition resize-none"
          />
          {errors.token && (
            <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.token.message}
            </p>
          )}
        </div>

        {formError && (
          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#2C384E]">
          <Button variant="ghost" type="button" size="sm" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            size="sm"
            isLoading={isPending}
            className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold"
          >
            {isPending ? 'Verifying & Linking...' : 'Verify & Link Accounts'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConnectSocialModal;
