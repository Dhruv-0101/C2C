import React from "react";
import { UserPlus, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

/**
 * CreateSubAdminScreen Component
 * In-page full-screen form replacing modal popups for creating new SubAdmin accounts.
 */
export const CreateSubAdminScreen = ({
  onBack,
  handleSubmit,
  onCreateSubAdmin,
  register,
  errors,
  selectedTabs = [],
  handleTabToggle,
  isPending,
}) => {
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
              <UserPlus className="w-5 h-5 text-amber-400" />
              <span>Create New SubAdmin Account</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Grant role-based access permissions to a new SubAdmin moderator.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-6">
        <form onSubmit={handleSubmit(onCreateSubAdmin)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Credentials Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#2C384E] pb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Account Information</span>
              </h3>

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
            </div>

            {/* Tab Access Permissions Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#2C384E] pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Granted Tab Permissions</span>
              </h3>
              <p className="text-xs text-slate-400">
                Check the specific Admin Console tabs this SubAdmin account is authorized to manage:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { id: "dashboard", label: "Dashboard Overview" },
                  { id: "templates", label: "AI Base Templates" },
                  { id: "festivals", label: "Festival Calendar" },
                  { id: "frames", label: "Brand Frames Studio" },
                  { id: "styles", label: "Design System & Palettes" },
                  { id: "categories", label: "Business Categories" },
                  { id: "users", label: "SMB User Directory" },
                ].map((tab) => {
                  const isChecked = selectedTabs.includes(tab.id);
                  return (
                    <div
                      key={tab.id}
                      onClick={() => handleTabToggle(tab.id)}
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
            <Button variant="primary" type="submit" isLoading={isPending}>
              Create SubAdmin Account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
