import React, { useState } from "react";
import { Pencil, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

/**
 * EditSubAdminScreen Component
 * In-page full-screen RBAC permission manager replacing modal dialogs.
 */
export const EditSubAdminScreen = ({ subAdmin, onBack, updateSubAdminMutation }) => {
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
    }, {
      onSuccess: () => {
        onBack();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#131B2A] border border-[#2C384E] text-slate-400 hover:text-white hover:border-amber-500/50 transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Directory</span>
          </button>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber-400" />
              <span>Update SubAdmin Permissions</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Modify permitted admin console tabs for <span className="text-amber-400 font-semibold">{subAdmin.email}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#2C384E] pb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Profile Details</span>
              </h3>

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
            </div>

            {/* Allowed Tabs Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#2C384E] pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Permitted Console Tabs</span>
              </h3>
              <p className="text-xs text-slate-400">
                Only checked tabs will be visible to this SubAdmin upon login:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { id: "dashboard", label: "Dashboard Overview" },
                  { id: "templates", label: "Graphic Templates" },
                  { id: "festivals", label: "Festival Calendar" },
                  { id: "frames", label: "Brand Frames Studio" },
                  { id: "styles", label: "Design System & Palettes" },
                  { id: "categories", label: "Business Categories" },
                  { id: "users", label: "Business User Directory" },
                ].map((tab) => {
                  const isChecked = editTabs.includes(tab.id);
                  return (
                    <div
                      key={tab.id}
                      onClick={() => handleToggle(tab.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm"
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
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C384E]">
            <Button variant="ghost" type="button" onClick={onBack}>
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
      </Card>
    </div>
  );
};
