import React from 'react';
import { Pencil, Trash2, Shield } from 'lucide-react';
import { ADMIN_TABS } from '@/shared/constants';
import { SkeletonTable } from '@/components/feedback/SkeletonLoader';

const TAB_BADGE_STYLES = {
  [ADMIN_TABS.TEMPLATES]: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  [ADMIN_TABS.FESTIVALS]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  [ADMIN_TABS.FRAMES]: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  [ADMIN_TABS.CATEGORIES]: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  [ADMIN_TABS.TEMPLATE_CATEGORIES]: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  [ADMIN_TABS.POSTS]: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  [ADMIN_TABS.USERS]: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
};

/**
 * SubAdminTable Component
 * Renders Moderator directory with permission pills, creation counters, and management actions.
 */
export const SubAdminTable = ({
  subAdmins = [],
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="py-2">
        <SkeletonTable rows={4} cols={5} />
      </div>
    );
  }

  if (subAdmins.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center border border-dashed border-[#2C384E] rounded-xl sm:rounded-2xl space-y-3 bg-[#131B2A]/30">
        <Shield className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-slate-300 font-semibold text-xs sm:text-sm">
          No SubAdmin accounts created yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Mobile Cards View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {subAdmins.map((admin) => {
          const counts = admin._count || {};
          const totalCreated =
            (counts.templatesCreated || 0) +
            (counts.festivalsCreated || 0) +
            (counts.framesCreated || 0) +
            (counts.templateCategoriesCreated || 0);

          return (
            <div
              key={admin.id}
              className="rounded-xl border border-[#2C384E] bg-[#131B2A] p-4 space-y-3.5 shadow-sm"
            >
              {/* Card Header: Avatar, Name, Email, Role */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold flex items-center justify-center shrink-0">
                    {admin.fullName?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-heading font-bold text-sm text-white truncate">
                      {admin.fullName || 'SubAdmin'}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                      {admin.email}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                  SUB_ADMIN
                </span>
              </div>

              {/* Allowed Admin Tabs */}
              <div className="space-y-1.5 pt-2 border-t border-[#2C384E]/70">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Permitted Tabs ({admin.allowedTabs?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {admin.allowedTabs?.length ? (
                    admin.allowedTabs.map((tabId) => {
                      const badgeStyle =
                        TAB_BADGE_STYLES[tabId] ||
                        'bg-slate-800 text-slate-300 border-slate-700';
                      return (
                        <span
                          key={tabId}
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold capitalize ${badgeStyle}`}
                        >
                          {tabId}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      No permissions granted
                    </span>
                  )}
                </div>
              </div>

              {/* Items Created */}
              <div className="space-y-1.5 pt-2 border-t border-[#2C384E]/70">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Items Created in System
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {totalCreated === 0 ? (
                    <span className="text-[11px] text-slate-500 italic">
                      0 items created
                    </span>
                  ) : (
                    <>
                      <span className="px-2 py-0.5 rounded-md border text-[10px] font-bold bg-amber-500/10 text-amber-300 border-amber-500/30">
                        Total: {totalCreated}
                      </span>
                      {counts.festivalsCreated > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md border text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                          🎆 {counts.festivalsCreated} Fest
                        </span>
                      )}
                      {counts.templateCategoriesCreated > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md border text-[10px] bg-teal-500/10 text-teal-300 border-teal-500/30">
                          🏷️ {counts.templateCategoriesCreated} TplCat
                        </span>
                      )}
                      {counts.framesCreated > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md border text-[10px] bg-sky-500/10 text-sky-300 border-sky-500/30">
                          🖼️ {counts.framesCreated} Frames
                        </span>
                      )}
                      {counts.templatesCreated > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md border text-[10px] bg-purple-500/10 text-purple-300 border-purple-500/30">
                          🎨 {counts.templatesCreated} Tpl
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Actions Toolbar */}
              <div className="pt-2.5 border-t border-[#2C384E] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(admin)}
                  className="flex-1 min-h-[38px] px-3 py-1.5 rounded-lg border border-[#2C384E] bg-[#0B0F17] text-slate-200 hover:text-white hover:border-slate-600 transition flex items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Permissions</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(admin)}
                  className="min-h-[38px] min-w-[38px] px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition flex items-center justify-center gap-1.5 text-xs font-semibold"
                  title="Delete SubAdmin account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="min-[380px]:inline hidden">Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Contained Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar rounded-xl border border-[#2C384E] bg-[#131B2A]">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-[#0B0F17] text-slate-400 uppercase tracking-wider font-bold border-b border-[#2C384E]">
            <tr>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Allowed Admin Tabs</th>
              <th className="py-3 px-4">Items Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2C384E]">
            {subAdmins.map((admin) => {
              const counts = admin._count || {};
              const totalCreated =
                (counts.templatesCreated || 0) +
                (counts.festivalsCreated || 0) +
                (counts.framesCreated || 0) +
                (counts.templateCategoriesCreated || 0);

              return (
                <tr key={admin.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {admin.fullName || 'SubAdmin'}
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
                            'bg-slate-800 text-slate-300 border-slate-700';
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
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {totalCreated === 0 ? (
                        <span className="text-[10px] text-slate-500 italic">
                          0 items created
                        </span>
                      ) : (
                        <>
                          <span className="px-2 py-0.5 rounded-md border text-[10px] font-bold bg-amber-500/10 text-amber-300 border-amber-500/30">
                            Total: {totalCreated}
                          </span>
                          {counts.festivalsCreated > 0 && (
                            <span
                              className="px-1.5 py-0.5 rounded-md border text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              title="Festivals Created"
                            >
                              🎆 {counts.festivalsCreated} Fest
                            </span>
                          )}
                          {counts.templateCategoriesCreated > 0 && (
                            <span
                              className="px-1.5 py-0.5 rounded-md border text-[10px] bg-teal-500/10 text-teal-300 border-teal-500/30"
                              title="Template Categories Created"
                            >
                              🏷️ {counts.templateCategoriesCreated} TplCat
                            </span>
                          )}
                          {counts.framesCreated > 0 && (
                            <span
                              className="px-1.5 py-0.5 rounded-md border text-[10px] bg-sky-500/10 text-sky-300 border-sky-500/30"
                              title="Frames Created"
                            >
                              🖼️ {counts.framesCreated} Frames
                            </span>
                          )}
                          {counts.templatesCreated > 0 && (
                            <span
                              className="px-1.5 py-0.5 rounded-md border text-[10px] bg-purple-500/10 text-purple-300 border-purple-500/30"
                              title="Templates Created"
                            >
                              🎨 {counts.templatesCreated} Tpl
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(admin)}
                        className="p-2 min-w-[34px] min-h-[34px] rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
                        title="Edit SubAdmin permissions"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(admin)}
                        className="p-2 min-w-[34px] min-h-[34px] rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer flex items-center justify-center"
                        title="Delete SubAdmin account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubAdminTable;
