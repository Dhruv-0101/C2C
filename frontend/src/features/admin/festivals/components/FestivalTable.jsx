import React from 'react';
import { Calendar, Trash2, Edit2 } from 'lucide-react';
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
}) => {
  if (isLoading) {
    return (
      <div className="py-2">
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (festivals.length === 0) {
    return <div className="p-8 text-center text-slate-500 italic">No festivals found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Festival Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Region</TableHead>
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
  );
};

export default FestivalTable;
