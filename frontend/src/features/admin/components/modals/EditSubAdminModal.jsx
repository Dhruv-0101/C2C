import React, { useState } from "react";
import { Pencil, X, CheckCircle2 } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

/**
 * EditSubAdminModal Component
 * Enterprise RBAC permission manager dialog allowing SuperAdmin to update SubAdmin tab access rights.
 */
export const EditSubAdminModal = ({ subAdmin, onClose, updateSubAdminMutation }) => {
  const [editTabs, setEditTabs] = useState(subAdmin.allowedTabs || []);
  const [fullName, setFullName] = useState(subAdmin.fullName || "");
  const [email, setEmail] = useState(subAdmin.email || "");

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
    });
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
          <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <Pencil className="w-4 h-4 text-amber-400" />
            <span>Update SubAdmin Permissions</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <p className="text-[11px] text-slate-400">
              Only checked tabs will be visible to this SubAdmin upon login.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { id: "templates", label: "AI Base Templates" },
                { id: "festivals", label: "Festival Calendar" },
                { id: "frames", label: "Brand Frames Studio" },
                { id: "styles", label: "Design System & Palettes" },
                { id: "categories", label: "Business Categories" },
                { id: "users", label: "SMB User Directory" },
              ].map((tab) => {
                const isChecked = editTabs.includes(tab.id);
                return (
                  <label
                    key={tab.id}
                    onClick={() => handleToggle(tab.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                      isChecked
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                        : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
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

          <div className="flex justify-end gap-3 pt-3 border-t border-[#2C384E]">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={updateSubAdminMutation.isPending}
            >
              Save Permissions
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
