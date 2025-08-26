// src/app/dashboard/overview/page.tsx
"use client";

import TableComponent from "@/components/TableComponent";
import { useAuth } from "@/context/AuthContext";

export default function DocumentPage() {
  const { user } = useAuth();
  const rows:any = [];
  
  return(
  <main className="flex-1 bg-gray-100 h-screen overflow-hidden">
    <div className="mt-10 mb-20 p-4 gap-4 h-screen overflow-auto bg-white rounded-xl shadow flex flex-col">

      {/* Row 1: 20% height */}
      <div className="flex justify-between items-start h-1/8">

        {/* Left side: Title + Search */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Document Management</h1>
          
          {/* Search box with icon */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 border rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* Search icon */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* Right side: Wide button */}
        <button className="bg-blue-500 text-white px-6 py-3 mt-4 mr-1 rounded-lg hover:bg-blue-600 flex items-center gap-2">
          Upload Document
        </button>

      </div>

      {/* Row 1: 20% height */}
      <div className="flex flex-1 gap-2">
        {/* Left Column: 70% width */}
        <div className="flex-[0.7] bg-gray-50 rounded-2xl p-3 overflow-auto">
          <TableComponent rows={rows}></TableComponent>
        </div>

        {/* Right Column: 30% width */}
        <div className="flex-[0.3] flex flex-col gap-9  ">
          {/* Document Details */}
         <div className="bg-white p-2 rounded-2xl shadow-md border border-gray-100">
            {/* Title with icon */}
            <div className="flex items-center gap-3 mb-1">
              <span className="text-blue-500 text-2xl">📄</span>
              <h2 className="text-xl font-bold text-gray-800">Document 1</h2>
            </div>

            {/* Optional description */}
            <p className="text-gray-500 text-sm mb-2">
              This is a short description of the document, explaining its purpose.
            </p>

            {/* Details list */}
            <dl className="divide-y divide-gray-100 text-gray-700">
              <div className="flex justify-between py-2">
                <dt className="font-medium">Type:</dt>
                <dd>PDF</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="font-medium">Size:</dt>
                <dd>2 MB</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="font-medium">Uploaded By:</dt>
                <dd>John</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="font-medium">Date:</dt>
                <dd>Jan 12, 2025</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">🏷️ Tags</h2>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full">Finance</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 text-sm rounded-full">Q1</span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 text-sm rounded-full">Confidential</span>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">⚡ Actions</h2>
            <div className="flex gap-4 w-full justify-evenly">
              <button className="flex items-center justify-center gap-2 bg-red-500 text-white font-medium px-5 py-2 rounded-lg shadow hover:bg-red-600 transition w-28">
                 Delete
              </button>
              <button className="flex items-center justify-center gap-2 bg-blue-500 text-white font-medium px-5 py-2 rounded-lg shadow hover:bg-blue-600 transition w-32">
                Download
              </button>
            </div>
          </div>
        </div>

      </div>



    </div>
  </main>
 
  )
}
