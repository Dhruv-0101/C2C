import React from 'react';
import { SearchBar } from '../../../../components/ui/SearchBar';
import { Select } from '../../../../components/ui/Select';

export const AdminPostFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  categories = [],
}) => {
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const statusOptions = [
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'DRAFT', label: 'Draft' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs">
      <div className="w-full sm:w-72">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search by user or caption..."
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statusOptions}
          placeholder="All Statuses"
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={categoryOptions}
          placeholder="All Categories"
        />
      </div>
    </div>
  );
};

export default AdminPostFilters;
