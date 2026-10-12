import React, { useState, useEffect } from "react";
import {
  FolderKanban,
  Building2,
  X,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { useCategoryTenants } from "../hooks/useCategoryTenants";
import { useDebounce } from "@/shared/hooks/useDebounce";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/shared/utils/date.util";

/**
 * CategoryTenantsModal Component
 * Enterprise inspector modal displaying all business tenants (Brand Kits & owners)
 * connected to a specific Master Business Category.
 * Features live debounced search, server-side pagination, contact badges, and subscription statuses.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Modal dismissal callback
 * @param {Object|null} props.category - Active category entity ({ id, name, slug, description, _count, ... })
 */
export const CategoryTenantsModal = ({ isOpen, onClose, category }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  // Reset pagination state when modal opens or category changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setSearch("");
    }
  }, [isOpen, category?.id]);

  // Reset page to 1 on search filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const {
    tenants = [],
    meta,
    isLoading,
    error,
  } = useCategoryTenants(
    category?.id,
    {
      page,
      limit,
      search: debouncedSearch || undefined,
    },
    { enabled: Boolean(isOpen && category?.id) }
  );

  if (!isOpen || !category) return null;

  const totalTenants =
    meta?.totalItems ??
    category._count?.brandKits ??
    tenants.length;

  return (
    <div
      className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in bg-slate-950/80 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] bg-[#131B2A] border border-[#2C384E] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#2C384E] flex items-center justify-between gap-4 shrink-0 bg-[#0B0F17]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-extrabold text-lg text-white truncate">
                  {category.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700 font-semibold shrink-0">
                  {category.slug}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold shrink-0">
                  🏢 {totalTenants} {totalTenants === 1 ? "Business Tenant" : "Business Tenants"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {category.description || "Master industry category for registered business tenants."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition cursor-pointer shrink-0"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Stats Strip */}
        <div className="px-5 py-3.5 border-b border-[#2C384E] bg-[#0E1522] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search business name, owner, city, or phone in ${category.name}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#131B2A] border border-[#2C384E] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Showing:</span>
            <span className="text-amber-400 font-bold">{tenants.length}</span>
            <span>of</span>
            <span className="text-white font-bold">{totalTenants}</span>
            <span>Tenants</span>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: limit }).map((_, i) => (
                <div
                  key={`skel-tenant-${i}`}
                  className="border border-[#2C384E] rounded-2xl p-4 bg-[#0B0F17] space-y-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-slate-800 rounded w-1/2" />
                      <div className="h-3 bg-slate-800 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-10 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs">
              Failed to load business tenants for this category. Please try again.
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl text-slate-400 text-xs space-y-2 bg-[#0B0F17]/40">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6 text-amber-400" />
              </div>
              <p className="font-heading font-bold text-sm text-white">
                {search
                  ? `No businesses matching "${search}"`
                  : "No business tenants connected to this category yet"}
              </p>
              <p className="text-slate-400 max-w-md mx-auto">
                {search
                  ? "Try searching by a different business name, email, or contact number."
                  : `Small businesses that select "${category.name}" during Brand Kit setup will automatically be listed here.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenants.map((b) => {
                const user = b.user || {};
                const sub = user.subscription || {};
                const isPro = sub.plan === "PRO";
                const isActive = user.isActive !== false;
                const location = [b.city, b.state, b.country].filter(Boolean).join(", ");

                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-[#2C384E] bg-[#0B0F17] hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3.5 group shadow-sm"
                  >
                    {/* Header: Logo, Business Name, Owner & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {b.logoUrl ? (
                          <img
                            src={b.logoUrl}
                            alt={b.businessName}
                            className="w-11 h-11 rounded-xl object-contain bg-white/5 border border-[#2C384E] shrink-0 p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 via-indigo-500/20 to-purple-500/20 border border-[#2C384E] text-amber-400 font-extrabold text-base flex items-center justify-center shrink-0">
                            {b.businessName?.charAt(0) || "B"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="font-heading font-bold text-sm text-white truncate group-hover:text-amber-400 transition-colors">
                            {b.businessName}
                          </h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-300 font-medium">{user.fullName || "User"}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-400 truncate max-w-[150px]">{user.email}</span>
                          </p>
                        </div>
                      </div>

                      {/* Subscription & Account Status Pills */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isPro ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase">
                            <Zap className="w-2.5 h-2.5 fill-indigo-400" /> Pro Plan
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-medium uppercase">
                            Free Plan
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <ShieldCheck className="w-2.5 h-2.5" /> Active
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-2.5 h-2.5" /> Suspended
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Tagline / USPs */}
                    {b.tagline && (
                      <p className="text-[11px] text-slate-300 italic line-clamp-1 bg-[#131B2A] px-2.5 py-1 rounded-lg border border-[#2C384E]/60">
                        "{b.tagline}"
                      </p>
                    )}

                    {/* Details Grid: Phone, Location, Joined Date */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#2C384E]/60 text-slate-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="font-mono text-slate-300 truncate">
                          {b.phone || b.whatsapp || "No Phone"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{location || "India"}</span>
                      </div>

                      <div className="flex items-center gap-1.5 col-span-2 text-[10px] font-mono text-slate-500 pt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>Connected: {formatDate(b.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer with Pagination */}
        {tenants.length > 0 && (
          <div className="p-4 border-t border-[#2C384E] bg-[#0B0F17] shrink-0">
            <Pagination
              meta={meta}
              currentPage={page}
              totalPages={meta?.totalPages || Math.max(1, Math.ceil(totalTenants / limit))}
              onPageChange={(newPage) => setPage(newPage)}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              pageSizeOptions={[8, 12, 16, 24]}
              className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTenantsModal;
