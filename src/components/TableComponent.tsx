// src/components/TableComponent.tsx
import React from "react";

interface TableRow {
  name: string;
  type: string;
  uploadedBy: string;
  date: string;
}

interface TableComponentProps {
  rows: TableRow[];
}

const TableComponent: React.FC<TableComponentProps> = ({ rows }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md h-[650px] overflow-y-auto">
        <table className="w-full text-base table-fixed border-collapse">
            <thead className="sticky top-0 bg-white z-10">
            <tr>
                <th className="w-1/3 px-6 py-4 font-semibold text-gray-700 uppercase border-b text-center leading-relaxed">
                Name
                </th>
                <th className="w-1/6 px-6 py-4 font-semibold text-gray-700 uppercase border-b text-center leading-relaxed">
                Type
                </th>
                <th className="w-1/4 px-6 py-4 font-semibold text-gray-700 uppercase border-b text-center leading-relaxed">
                Uploaded By
                </th>
                <th className="w-1/5 px-6 py-4 font-semibold text-gray-700 uppercase border-b text-center leading-relaxed">
                Date
                </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 text-center break-words leading-relaxed">
                    {row.name}
                </td>
                <td className="px-6 py-4 text-gray-700 text-center leading-relaxed">{row.type}</td>
                <td className="px-6 py-4 text-gray-700 text-center leading-relaxed">{row.uploadedBy}</td>
                <td className="px-6 py-4 text-gray-500 text-center leading-relaxed">{row.date}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
  );
};


export default TableComponent;
