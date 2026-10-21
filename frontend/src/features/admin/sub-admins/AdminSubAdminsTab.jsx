import React, { useState } from "react";
import { Shield, UserPlus, Pencil, Trash2, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SearchBar } from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { ADMIN_TABS } from '@/shared/constants';
import { SubAdminTable } from "./components/SubAdminTable";
import { DeleteSubAdminModal } from "./components/DeleteSubAdminModal";

// Color mapping helper for distinct visual RBAC permission pill badges
const TAB_BADGE_STYLES = {
  [ADMIN_TABS.TEMPLATES]: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  [ADMIN_TABS.FESTIVALS]: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  [ADMIN_TABS.FRAMES]: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  [ADMIN_TABS.CATEGORIES]: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  [ADMIN_TABS.TEMPLATE_CATEGORIES]: "bg-teal-500/20 text-teal-300 border-teal-500/40",
  [ADMIN_TABS.POSTS]: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  [ADMIN_TABS.USERS]: "bg-amber-500/20 text-amber-300 border-amber-500/40",
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
  onNavigateTab,
}) => {
  const [subAdminToDelete, setSubAdminToDelete] = useState(null);

  /**
   * Opens the confirmation modal before permanently deleting a SubAdmin account
   * @param {Object|string} subAdminOrId - SubAdmin object or identifier
   */
  const handleDeleteSubAdmin = (subAdminOrId) => {
    const targetAdmin =
      typeof subAdminOrId === "object" && subAdminOrId !== null
        ? subAdminOrId
        : subAdmins.find((a) => a.id === subAdminOrId) || { id: subAdminOrId, fullName: "SubAdmin" };
    setSubAdminToDelete(targetAdmin);
  };

  /**
   * Confirms deletion and fires mutation
   * @param {string} id - SubAdmin user ID
   */
  const handleConfirmDelete = (id) => {
    if (!id) return;
    deleteSubAdminMutation?.mutate(id, {
      onSuccess: () => {
        setSubAdminToDelete(null);
      },
    });
  };

  return (
    <div className="animate-in fade-in duration-200 space-y-4 sm:space-y-5">
      {/* SubAdmin Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 border-b border-[#2C384E] pb-4">
        <div>
          <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <span>SubAdmin Accounts Directory</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            SuperAdmin exclusive privilege to create, edit permissions, and revoke SubAdmin tab access.
          </p>
        </div>

        <div className="flex flex-col min-[520px]:flex-row items-stretch min-[520px]:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
          <SearchBar
            value={subAdminSearch}
            onChange={(val) => {
              const query = typeof val === "string" ? val : (val?.target?.value ?? "");
              setSubAdminSearch(query);
              setSubAdminPage(1);
            }}
            placeholder="Search subadmins..."
            className="w-full min-[520px]:w-64"
          />

          <div className="flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-2 sm:gap-3 w-full min-[520px]:w-auto">
            {onNavigateTab && (
              <Button
                variant="outline"
                icon={Activity}
                onClick={() => onNavigateTab(ADMIN_TABS.SUB_ADMIN_ACTIVITY)}
                className="border-[#2C384E] text-amber-400 hover:text-amber-300 hover:border-amber-500/50 flex-1 min-[380px]:flex-initial justify-center min-h-[40px]"
              >
                View Works & Audit
              </Button>
            )}

            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => setIsModalOpen(true)}
              className="flex-1 min-[380px]:flex-initial justify-center min-h-[40px]"
            >
              Create SubAdmin
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {subAdminFetchError && (
        <Alert variant="error" message={subAdminFetchError.message} />
      )}

      {/* Table Content */}
      <SubAdminTable
        subAdmins={subAdmins}
        isLoading={isLoadingSubAdmins}
        onEdit={(admin) => {
          setEditingSubAdmin(admin);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteSubAdmin}
      />

      {subAdmins.length > 0 && (
        <Pagination
          meta={subAdminMeta}
          currentPage={subAdminPage}
          totalPages={subAdminMeta?.totalPages || 1}
          onPageChange={setSubAdminPage}
          onLimitChange={(newLimit) => {
            setSubAdminLimit(newLimit);
            setSubAdminPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}

      {/* Delete SubAdmin Confirmation Modal */}
      <DeleteSubAdminModal
        isOpen={Boolean(subAdminToDelete)}
        onClose={() => setSubAdminToDelete(null)}
        subAdmin={subAdminToDelete}
        onConfirm={handleConfirmDelete}
        isPending={deleteSubAdminMutation?.isPending}
      />
    </div>
  );
};


export default AdminSubAdminsTab;
