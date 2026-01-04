// src/components/TableComponent.tsx
import React, { useState } from "react";

interface TableRow {
  name: string;
  type: string;
  uploadedBy: string;
  date: string;
}

type SortField = 'fileName' | 'fileType' | 'size' | 'userName' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface TableComponentProps {
  rows: TableRow[];
  onRowClick?: (document: any) => void;
  selectedDocument?: any;
  isAdmin?: boolean;
}

const TableComponent: React.FC<TableComponentProps> = ({ rows, onRowClick, selectedDocument, isAdmin = false }) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedRows = [...rows].sort((a: any, b: any) => {
    let aValue, bValue;

    switch (sortField) {
      case 'fileName':
        aValue = a.fileName.toLowerCase();
        bValue = b.fileName.toLowerCase();
        break;
      case 'fileType':
        aValue = a.fileType.toLowerCase();
        bValue = b.fileType.toLowerCase();
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      case 'userName':
        aValue = a.user.name.toLowerCase();
        bValue = b.user.name.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-white/50 ml-1">⇅</span>;
    }
    return (
      <span className="ml-1">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  return (
    <div className="bg-slate-800 h-full overflow-hidden">
        <table className="w-full text-base table-fixed border-collapse min-w-0">
            <thead className="bg-gradient-to-r from-purple-700 via-pink-700 to-purple-700 shadow-lg">
            <tr>
                <th 
                  onClick={() => handleSort('fileName')}
                  className={`${isAdmin ? 'w-[30%]' : 'w-[40%]'} px-6 py-3 font-bold text-white uppercase text-xs tracking-wider text-left cursor-pointer hover:bg-purple-700/50 transition-colors`}>
                  <div className="flex items-center">
                    📄 Document Name
                    <SortIcon field="fileName" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('fileType')}
                  className={`${isAdmin ? 'w-[15%]' : 'w-[20%]'} px-6 py-3 font-bold text-white uppercase text-xs tracking-wider text-left cursor-pointer hover:bg-purple-700/50 transition-colors`}>
                  <div className="flex items-center">
                    📋 Format
                    <SortIcon field="fileType" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('size')}
                  className={`${isAdmin ? 'w-[12%]' : 'w-[20%]'} px-6 py-3 font-bold text-white uppercase text-xs tracking-wider text-left cursor-pointer hover:bg-purple-700/50 transition-colors`}>
                  <div className="flex items-center">
                    💾 Size
                    <SortIcon field="size" />
                  </div>
                </th>
                {isAdmin && (
                  <th 
                    onClick={() => handleSort('userName')}
                    className="w-[18%] px-6 py-3 font-bold text-white uppercase text-xs tracking-wider text-left cursor-pointer hover:bg-purple-700/50 transition-colors">
                    <div className="flex items-center">
                      👤 User
                      <SortIcon field="userName" />
                    </div>
                  </th>
                )}
                <th 
                  onClick={() => handleSort('createdAt')}
                  className={`${isAdmin ? 'w-[15%]' : 'w-[20%]'} px-6 py-3 font-bold text-white uppercase text-xs tracking-wider text-left cursor-pointer hover:bg-purple-700/50 transition-colors`}>
                  <div className="flex items-center">
                    📅 Date
                    <SortIcon field="createdAt" />
                  </div>
                </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-900 to-pink-900 rounded-full flex items-center justify-center">
                      <span className="text-4xl">📭</span>
                    </div>
                    <div>
                      <p className="text-slate-300 font-semibold mb-1">No documents uploaded yet</p>
                      <p className="text-slate-500 text-xs">Click "Upload Document" to get started</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedRows.map((document: any) => {
                const isSelected = selectedDocument?.id === document.id;
                return (
                  <tr 
                    key={document.id} 
                    onClick={() => onRowClick?.(document)}
                    className={`group transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-gradient-to-r from-purple-900 to-pink-900 border-l-4 border-purple-500 shadow-md' 
                        : 'hover:bg-slate-700/50 hover:shadow-sm'
                    }`}>
                    <td className="px-6 py-1.5 font-semibold text-slate-100 text-left truncate text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isSelected ? 'scale-110' : ''} transition-transform`}>📄</span>
                          {document.fileName}
                        </div>
                    </td>
                    <td className="px-6 py-1.5 text-slate-300 text-left text-xs truncate">
                      <span className="px-1.5 py-0.5 bg-slate-700 rounded font-medium text-[10px]">
                        {document.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                    </td>
                    <td className="px-6 py-1.5 text-slate-200 text-left font-medium text-xs">
                      {(document.size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-1.5 text-slate-200 text-left font-medium truncate text-xs">{document.user.name}</td>
                    )}
                    <td className="px-6 py-1.5 text-slate-400 text-left text-[10px]">{new Date(document.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                );
              })
            )}
            </tbody>
        </table>
    </div>
  );
};


export default TableComponent;
