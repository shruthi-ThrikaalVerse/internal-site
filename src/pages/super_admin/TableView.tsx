
import React from 'react';
import { SectionHeader } from '../../components/super_admin/UI.tsx';

interface TableViewProps<T> {
  data: T[];
  columns: { key: keyof T; label: string; render?: (val: any, row: T) => React.ReactNode }[];
  title: string;
  description: string;
  headerActions?: React.ReactNode;
  onEdit?: (item: T) => void;
}

export const TableView = <T extends { id: string }>({
  data,
  columns,
  title,
  description,
  headerActions,
  onEdit
}: TableViewProps<T>) => {
  return (
    <div className="space-y-6">
      <SectionHeader title={title} description={description} actions={headerActions} />
      <div className="bg-[#0b1220] rounded-xl border border-[#1f2937] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide sm:scrollbar-default">
          <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-0">
            <thead className="bg-[#0f172a] border-b border-[#1f2937]">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-[#9aa8bd] uppercase tracking-wider">{col.label}</th>
                ))}
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-semibold text-[#9aa8bd] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-[#0f172a] transition-colors">
                    {columns.map((col, idx) => (
                      <td key={idx} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#e6eef8]">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
                      </td>
                    ))}
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right">
                      <button
                        onClick={() => onEdit?.(row)}
                        className="text-[#f37321] font-bold hover:text-[#e06410] transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-[#9aa8bd] text-sm italic">
                    No matching records found for this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
