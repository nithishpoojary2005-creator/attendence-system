import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const Table = ({
  columns,
  data = [],
  searchPlaceholder = 'Search...',
  searchKeys = [], // Fields to search inside (e.g. ['name', 'roll'])
  itemsPerPage = 10,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 1. Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || searchKeys.length === 0) {
      return data;
    }
    const query = searchTerm.toLowerCase();
    return data.filter((item) => {
      return searchKeys.some((key) => {
        const val = item[key];
        return val ? String(val).toLowerCase().includes(query) : false;
      });
    });
  }, [data, searchTerm, searchKeys]);

  // 2. Sort Data
  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === bVal) return 0;
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = String(aVal).localeCompare(String(bVal), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // 3. Paginate Data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Search Header */}
      {searchKeys.length > 0 && (
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-150 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:text-white transition-all text-sm"
          />
        </div>
      )}

      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <table className="w-full min-w-max border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-150 dark:border-slate-750">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && requestSort(col.key)}
                  className={`px-6 py-4 font-semibold text-gray-700 dark:text-gray-350 select-none ${
                    col.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <ArrowUpDown size={14} className="text-gray-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <p className="font-medium text-base">No records found</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try expanding your search query or filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 font-medium text-gray-900 dark:text-slate-200">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedData.length > itemsPerPage && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of{' '}
            {sortedData.length} records
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const isSelected = currentPage === pageNumber;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-gray-250 dark:border-slate-800 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
