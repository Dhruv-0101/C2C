import React from "react";
import { UserPlus, X, CheckCircle2 } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

/**
 * CreateSubAdminModal Component
 * Dialog allowing SuperAdmin to create a new SubAdmin account with specific RBAC tab permissions.
 */
export const CreateSubAdminModal = ({
  onClose,
  handleSubmit,
  onCreateSubAdmin,
  register,
  errors,
  selectedTabs = [],
  handleTabToggle,
  isPending,
}) => {
  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
          <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Create SubAdmin Account</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onCreateSubAdmin)} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="SubAdmin Name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="subadmin@company.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password *"
            type="password"
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register("password")}
          />

          {/* Tab Permissions Selection */}
          <div className="space-y-2 pt-2 border-t border-[#2C384E]">
            <label className="text-xs font-bold text-white block">
              Granted Admin Console Tab Access:
            </label>
            <p className="text-[11px] text-slate-400">
              Check the Admin Console tabs that this SubAdmin is permitted to manage.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { id: "templates", label: "Graphic Templates" },
                { id: "festivals", label: "Festival Calendar" },
                { id: "frames", label: "Brand Frames Studio" },
                { id: "styles", label: "Design System & Palettes" },
                { id: "categories", label: "Business Categories" },
                { id: "users", label: "Business User Directory" },
              ].map((tab) => {
                const isChecked = selectedTabs.includes(tab.id);
                return (
                  <label
                    key={tab.id}
                    onClick={() => handleTabToggle(tab.id)}
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
            <Button variant="primary" type="submit" isLoading={isPending}>
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
