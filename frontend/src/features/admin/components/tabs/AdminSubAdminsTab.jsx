import React from "react";
import { Shield, UserPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Alert } from "../../../../components/ui/Alert";
import { SearchBar } from "../../../../components/common/SearchBar";
import Pagination from "../../../../components/common/Pagination";

// Color mapping helper for distinct visual RBAC permission pill badges
const TAB_BADGE_STYLES = {
  templates: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  festivals: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  frames: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  styles: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  categories: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  users: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

/**
 * AdminSubAdminsTab Component
 * SuperAdmin exclusive table directory managing SubAdmin user accounts and RBAC access permissions.
 */
export const AdminSubAdminsTab = ({
  subAdmins = [],
  subAdminMeta,
  isLoadingSubAdmins,
  subAdminFetchError,
  subAdminSearch,
  setSubAdminSearch,
  subAdminPage,
  setSubAdminPage,
  setSubAdminLimit,
  setIsModalOpen,
  setEditingSubAdmin,
  deleteSubAdminMutation,
}) => {
  return (
    <div className="animate-in fade-in duration-200 space-y-4">
      {/* SubAdmin Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
        <div>
          <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span>SubAdmin Accounts Directory</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            SuperAdmin exclusive privilege to create, edit permissions, and revoke SubAdmin tab access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar
            value={subAdminSearch}
            onChange={(e) => {
              setSubAdminSearch(e.target.value);
              setSubAdminPage(1);
            }}
            placeholder="Search subadmins..."
            className="max-w-sm"
          />

          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsModalOpen(true)}
          >
            Create SubAdmin
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {subAdminFetchError && (
        <Alert variant="error" message={subAdminFetchError.message} />
      )}

      {/* Table Content */}
      {isLoadingSubAdmins ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          Loading SubAdmin directory...
        </div>
      ) : subAdmins.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-xl space-y-3">
          <Shield className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">
            No SubAdmin accounts created yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#2C384E] bg-[#131B2A]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0F17] text-slate-400 uppercase tracking-wider font-bold border-b border-[#2C384E]">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Allowed Admin Tabs</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C384E]">
                {subAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {admin.fullName || "SubAdmin"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {admin.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {admin.allowedTabs?.length ? (
                          admin.allowedTabs.map((tabId) => {
                            const badgeStyle =
                              TAB_BADGE_STYLES[tabId] ||
                              "bg-slate-800 text-slate-300 border-slate-700";
                            return (
                              <span
                                key={tabId}
                                className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold capitalize transition-transform hover:scale-105 ${badgeStyle}`}
                              >
                                {tabId}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">
                            No permissions granted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingSubAdmin(admin)}
                          className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                          title="Edit SubAdmin Permissions"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSubAdminMutation.mutate(admin.id)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Revoke SubAdmin Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            meta={subAdminMeta}
            currentPage={subAdminPage}
            totalPages={subAdminMeta?.totalPages || 1}
            onPageChange={setSubAdminPage}
            onLimitChange={(newLimit) => {
              setSubAdminLimit(newLimit);
              setSubAdminPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
