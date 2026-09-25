import React from 'react';
import { FolderKanban } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Universal Empty State Feedback Component
 */
export const EmptyState = ({
  icon: Icon = FolderKanban,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[#2C384E] bg-[#0B0F17]/50 ${className}`}
    >
      <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-slate-400 mb-3 shadow-inner">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h4 className="font-heading font-bold text-base text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="text-xs font-semibold">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
