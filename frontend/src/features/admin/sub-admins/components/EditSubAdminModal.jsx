import React, { useState } from "react";
import { Pencil, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SUBADMIN_TAB_CONFIG } from '@/shared/constants';

/**
 * EditSubAdminModal Component
 * Enterprise RBAC permission manager dialog allowing SuperAdmin to update SubAdmin tab access rights.
 */
export const EditSubAdminModal = ({ subAdmin, onClose, onBack = onClose, updateSubAdminMutation }) => {
  const handleDismiss = onClose || onBack;
  const [editTabs, setEditTabs] = useState(subAdmin?.allowedTabs || []);
  const [fullName, setFullName] = useState(subAdmin?.fullName || "");
  const [email, setEmail] = useState(subAdmin?.email || "");

  const handleToggle = (tabId) => {
    if (editTabs.includes(tabId)) {
      setEditTabs(editTabs.filter((t) => t !== tabId));
    } else {
      setEditTabs([...editTabs, tabId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSubAdminMutation.mutate({
      id: subAdmin.id,
      data: {
        fullName: fullName.trim(),
        email: email.trim(),
        allowedTabs: editTabs,
      },
    }, {
      onSuccess: () => {
        if (handleDismiss) handleDismiss();
      }
    });
  };

  return (
    <div className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col bg-[#131B2A] border border-[#2C384E] rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2C384E] shrink-0 flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm sm:text-base text-white flex items-center gap-2">
            <Pencil className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Update SubAdmin Permissions</span>
          </h3>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 min-w-[36px] min-h-[36px] rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4"
        >
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-2 pt-2 border-t border-[#2C384E]">
            <label className="text-xs font-bold text-white block">
              Permitted Admin Console Tabs:
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Only checked tabs will be visible to this SubAdmin upon login.
            </p>

            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2 pt-2">
              {SUBADMIN_TAB_CONFIG.map((tab) => {
                const isChecked = editTabs.includes(tab.id);
                return (
                  <label
                    key={tab.id}
                    onClick={() => handleToggle(tab.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition select-none ${
                      isChecked
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                        : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="truncate pr-2">{tab.label}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked
                          ? "bg-amber-500 border-amber-500 text-slate-950"
                          : "border-slate-600 bg-slate-900"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex flex-col-reverse min-[360px]:flex-row justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[#2C384E]">
            <Button
              variant="ghost"
              type="button"
              onClick={handleDismiss}
              className="w-full min-[360px]:w-auto min-h-[40px] justify-center"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={updateSubAdminMutation.isPending}
              className="w-full min-[360px]:w-auto min-h-[40px] justify-center"
            >
              Save Permissions
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubAdminModal;
