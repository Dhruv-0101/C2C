import React, { useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Zap } from 'lucide-react';

/**
 * QuotaTopUpModal Component
 * Dialog allowing admins to grant bonus post generation credits to tenants.
 */
export const QuotaTopUpModal = ({ isOpen, onClose, user, onConfirm, isPending }) => {
  const [quota, setQuota] = useState('10');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onConfirm && user) {
      onConfirm({ userId: user.id, bonusPosts: Number(quota) || 10 });
      onClose();
    }
  };

  const PRESETS = [10, 25, 50, 100];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Top-Up Post Quota"
      description={`Grant bonus graphic generation credits to ${user?.fullName || user?.email || 'User'}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-bold mb-1.5">
            Quick Bonus Presets
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setQuota(String(p))}
                className={`py-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
                  Number(quota) === p
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/40'
                    : 'bg-[#0B0F17] text-slate-400 border-[#2C384E] hover:text-white hover:border-slate-600'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>+{p}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">Custom Amount</label>
          <Input
            type="number"
            min="1"
            max="10000"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            className="bg-[#0B0F17] border-[#2C384E] text-xs text-white"
            placeholder="e.g. 15"
            required
          />
        </div>

        <div className="pt-3 flex justify-end gap-2 border-t border-[#2C384E]">
          <Button variant="ghost" type="button" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" size="sm" isLoading={isPending}>
            Confirm +{quota} Credits
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuotaTopUpModal;
