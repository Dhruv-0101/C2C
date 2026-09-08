import React from "react";
import { Users } from "lucide-react";
import { Alert } from "../../../../components/ui/Alert";
import { SearchBar } from "../../../../components/common/SearchBar";
import Pagination from "../../../../components/common/Pagination";

/**
 * AdminUsersTab Component
 * Business User Directory tab displaying all registered business tenants and their BrandKit status.
 */
export const AdminUsersTab = ({
  users = [],
  userMeta,
  isLoadingUsers,
  usersFetchError,
  userSearch,
  setUserSearch,
  userPage,
  setUserPage,
  setUserLimit,
}) => {
  return (
    <div className="animate-in fade-in duration-200 space-y-4">
      {/* Business User Directory Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Business User Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Directory of registered small business tenants operating with active BrandKits.
          </p>
        </div>

        <SearchBar
          value={userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            setUserPage(1);
          }}
          placeholder="Search registered tenants..."
          className="max-w-sm"
        />
      </div>

      {/* Error Notification */}
      {usersFetchError && (
        <Alert variant="error" message={usersFetchError.message} />
      )}

      {/* Table Content */}
      {isLoadingUsers ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          Loading user directory...
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-xl space-y-3">
          <Users className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">
            No registered users found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#2C384E] bg-[#131B2A]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0F17] text-slate-400 uppercase tracking-wider font-bold border-b border-[#2C384E]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C384E]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
                        {u.fullName?.charAt(0) || "U"}
                      </div>
                      <span>{u.fullName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-semibold">
                      {u.brandKit?.businessName || "Not Setup"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono uppercase font-bold border border-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            meta={userMeta}
            currentPage={userPage}
            totalPages={userMeta?.totalPages || 1}
            onPageChange={setUserPage}
            onLimitChange={(newLimit) => {
              setUserLimit(newLimit);
              setUserPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
