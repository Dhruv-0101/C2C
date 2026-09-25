import React from 'react';
import { Calendar, Trash2, Edit2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { formatDate } from '../../../../shared/utils/date.util';

export const FestivalTable = ({ festivals = [], isLoading, onEdit, onDelete }) => {
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 italic">Loading festivals...</div>;
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
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {festivals.map((fest) => (
          <TableRow key={fest.id}>
            <TableCell className="font-semibold text-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{fest.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-slate-300 font-mono text-xs">
              {formatDate(fest.date)}
            </TableCell>
            <TableCell className="text-slate-400 text-xs">{fest.targetRegion || 'India'}</TableCell>
            <TableCell className="text-right space-x-2">
              <button
                onClick={() => onEdit && onEdit(fest)}
                className="p-1 rounded text-slate-400 hover:text-white transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete && onDelete(fest.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FestivalTable;
