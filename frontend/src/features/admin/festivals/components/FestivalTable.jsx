import React from 'react';
import { Calendar, Trash2, Edit2, Layers, Eye, Globe, Clock } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { formatDate } from '../../../../shared/utils/date.util';
import { SkeletonTable } from '@/components/feedback/SkeletonLoader';

export const FestivalTable = ({
  festivals = [],
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  isTogglingId,
  onOpenViewTemplates,
}) => {
  if (isLoading) {
    return (
      <div className="py-2">
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  if (festivals.length === 0) {
    return <div className="p-8 text-center text-slate-500 italic">No festivals found.</div>;
  }

  return (
    <div className="space-y-3">
      {/* 1. Mobile & Small Tablet Card Stack View (hidden on md+) */}
      <div className="block md:hidden space-y-3">
        {festivals.map((fest) => {
          const isActive = fest.isActive !== false;
          const festBanner = fest.bannerUrl || fest.imageUrl || fest.banner || null;
          const count =
            fest._count?.templates ??
            (Array.isArray(fest.templates) ? fest.templates.length : 0);
          const formattedDate = formatDate(fest.date) || '—';

          return (
            <div
              key={`mob-fest-${fest.id}`}
              className="p-4 rounded-2xl bg-[#131B2A] border border-[#2C384E] hover:border-amber-500/40 space-y-3 transition shadow-sm"
            >
              {/* Header: Banner/Icon, Name, Region & Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {festBanner ? (
                    <img
                      src={festBanner}
                      alt={fest.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#2C384E] shrink-0 mt-0.5"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                      <Calendar className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-heading font-bold text-white text-sm truncate">
                      {fest.name}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{formattedDate}</span>
                      </span>
                      {fest.targetRegion && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                          <Globe className="w-2.5 h-2.5 text-amber-400" />
                          <span>{fest.targetRegion}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenViewTemplates && onOpenViewTemplates(fest)}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="View Templates"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit && onEdit(fest)}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Edit Festival"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete && onDelete(fest.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Delete Festival"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description if present */}
              {fest.description && (
                <p className="text-xs text-slate-300 line-clamp-2 pl-0.5">
                  {fest.description}
                </p>
              )}

              {/* Bottom Meta Row: Linked Templates & Active Status */}
              <div className="pt-2.5 border-t border-[#2C384E]/60 flex items-center justify-between gap-2 flex-wrap text-xs">
                <button
                  type="button"
                  onClick={() => onOpenViewTemplates && onOpenViewTemplates(fest)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>{count} {count === 1 ? 'template' : 'templates'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleStatus && onToggleStatus(fest)}
                  disabled={isTogglingId === fest.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                  title={isActive ? 'Click to deactivate festival' : 'Click to activate festival'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  <span>{isActive ? 'Active' : 'Inactive'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Full Table View (hidden on mobile, visible on md+) */}
      <div className="hidden md:block bg-[#131B2A] border border-[#2C384E] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Festival Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Linked Templates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {festivals.map((fest) => {
                const isActive = fest.isActive !== false;
                const festBanner = fest.bannerUrl || fest.imageUrl || fest.banner || null;

                return (
                  <TableRow key={fest.id}>
                    <TableCell className="font-semibold text-white">
                      <div className="flex items-center gap-3">
                        {festBanner ? (
                          <img
                            src={festBanner}
                            alt={fest.name}
                            className="w-9 h-9 rounded-lg object-cover border border-[#2C384E] shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-amber-400" />
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-bold text-white block">{fest.name}</span>
                          {fest.description && (
                            <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px]">
                              {fest.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 font-mono text-xs">
                      {formatDate(fest.date)}
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs">{fest.targetRegion || 'India'}</TableCell>
                    <TableCell>
                      {(() => {
                        const count =
                          fest._count?.templates ??
                          (Array.isArray(fest.templates) ? fest.templates.length : 0);
                        return (
                          <button
                            type="button"
                            onClick={() => onOpenViewTemplates && onOpenViewTemplates(fest)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40 transition cursor-pointer group"
                            title={`View ${count} templates linked to ${fest.name}`}
                          >
                            <Layers className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                            <span>{count}</span>
                            <span className="text-[10px] text-amber-400/80 font-normal">
                              {count === 1 ? 'template' : 'templates'}
                            </span>
                          </button>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => onToggleStatus && onToggleStatus(fest)}
                        disabled={isTogglingId === fest.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                        }`}
                        title={isActive ? 'Click to deactivate festival (hide from calendar)' : 'Click to activate festival (show on calendar)'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span>{isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => onOpenViewTemplates && onOpenViewTemplates(fest)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                        title="View Templates"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit && onEdit(fest)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Edit Festival"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete && onDelete(fest.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Festival"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default FestivalTable;
