import React from 'react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Select } from '@/components/ui/Select';

/**
 * TemplateFilters
 * Search and Category/Festival dropdown filter bar for Graphic Templates.
 */
export const TemplateFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories = [],
  festival,
  onFestivalChange,
  festivals = [],
}) => {
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((c) => ({
      value: c.id || c.name,
      label: `${c.icon || '🎨'} ${c.name}`,
    })),
  ];

  const festivalOptions = festivals.length > 0 ? [
    { value: '', label: 'All Festivals' },
    ...festivals.map((f) => ({
      value: f.id,
      label: `🪔 ${f.name}`,
    })),
  ] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-[#0B0F17] border border-[#2C384E] rounded-2xl text-xs w-full">
      <div className="w-full sm:w-72">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search templates by title..."
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

      {festivalOptions && (
        <div className="w-full sm:w-48">
          <Select
            value={festival}
            onChange={(e) => onFestivalChange && onFestivalChange(e.target.value)}
            options={festivalOptions}
            placeholder="All Festivals"
          />
        </div>
      )}
    </div>
  );
};

export default TemplateFilters;
