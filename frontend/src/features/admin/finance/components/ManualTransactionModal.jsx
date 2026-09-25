import React from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Alert } from '../../../../components/ui/Alert';
import { formatCurrency } from '../../../../shared/utils/currency.util';

/**
 * Modal to record manual transaction / offline payment
 */
export const ManualTransactionModal = ({
  isOpen,
  onClose,
  manualData,
  setManualData,
  manualError,
  onSubmit,
  isPending,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-sans">
      <div className="w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-5 shadow-2xl my-auto text-slate-100">
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-white">
                Log Manual Payment / Bonus Transaction
              </h3>
              <p className="text-xs text-slate-400">
                Record offline payment, bank transfer, or custom plan top-up for a tenant.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {manualError && <Alert variant="error" message={manualError} />}

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Target User ID or Email
            </label>
            <Input
              value={manualData.userEmail}
              onChange={(e) =>
                setManualData({ ...manualData, userEmail: e.target.value, userId: e.target.value })
              }
              placeholder="Enter tenant user ID or user email..."
              className="bg-[#0B0F17] border-[#2C384E] text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Select Plan</label>
              <select
                value={manualData.plan}
                onChange={(e) => setManualData({ ...manualData, plan: e.target.value })}
                className="w-full bg-[#0B0F17] border border-[#2C384E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="PRO">Pro Plan</option>
                <option value="FREE">Free Plan</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Payment Method</label>
              <select
                value={manualData.paymentGateway}
                onChange={(e) =>
                  setManualData({ ...manualData, paymentGateway: e.target.value })
                }
                className="w-full bg-[#0B0F17] border border-[#2C384E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ADMIN_MANUAL">Admin Manual</option>
                <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                <option value="UPI">UPI Direct</option>
                <option value="CASH">Cash Payment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Currency</label>
              <select
                value={manualData.currency}
                onChange={(e) => setManualData({ ...manualData, currency: e.target.value })}
                className="w-full bg-[#0B0F17] border border-[#2C384E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-bold">Amount Paid</label>
                <span className="text-[10px] text-amber-400 font-mono font-semibold">
                  Preview: {formatCurrency(manualData.pricePaid, manualData.currency)}
                </span>
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={manualData.pricePaid}
                onChange={(e) => setManualData({ ...manualData, pricePaid: e.target.value })}
                placeholder="e.g. 999.00"
                className="bg-[#0B0F17] border-[#2C384E] text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Posts Credit</label>
              <Input
                type="number"
                value={manualData.postCount}
                onChange={(e) => setManualData({ ...manualData, postCount: e.target.value })}
                placeholder="e.g. 100"
                className="bg-[#0B0F17] border-[#2C384E] text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#2C384E] flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isPending}
              className="py-1.5 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              Confirm & Record Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
