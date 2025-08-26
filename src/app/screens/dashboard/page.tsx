"use client";

export default function DashboardPage() {
  const stats = [
    { id: 1, title: "Total Documents", value: 120, icon: "📄" },
    { id: 2, title: "Active Users", value: 45, icon: "👥" },
    { id: 3, title: "Tags", value: 18, icon: "🏷️" },
    { id: 4, title: "Pending Reviews", value: 7, icon: "⚡" },
  ];

  const recentDocuments = [
    { id: 1, name: "Document 1", uploadedBy: "John", date: "2025-08-22" },
    { id: 2, name: "Document 2", uploadedBy: "Alice", date: "2025-08-20" },
    { id: 3, name: "Document 3", uploadedBy: "Bob", date: "2025-08-18" },
    { id: 4, name: "Document 4", uploadedBy: "Jane", date: "2025-08-15" },
    { id: 5, name: "Document 5", uploadedBy: "Mike", date: "2025-08-12" },
    { id: 6, name: "Document 6", uploadedBy: "Sara", date: "2025-08-10" },
    { id: 1, name: "Document 1", uploadedBy: "John", date: "2025-08-22" },
    { id: 2, name: "Document 2", uploadedBy: "Alice", date: "2025-08-20" },
    { id: 3, name: "Document 3", uploadedBy: "Bob", date: "2025-08-18" },
    { id: 4, name: "Document 4", uploadedBy: "Jane", date: "2025-08-15" },
    { id: 5, name: "Document 5", uploadedBy: "Mike", date: "2025-08-12" },
    { id: 6, name: "Document 6", uploadedBy: "Sara", date: "2025-08-10" },
  ];

  return (
   <main className="flex-1 bg-gray-100 h-screen">
    <div className="p-6 h-full flex flex-col gap-6">

    {/* Header */}
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl shadow hover:bg-gray-100 transition"
            >
              <span className="text-3xl">{stat.icon}</span>
              <div className="flex flex-col">
                <span className="text-gray-800 font-medium">{stat.title}</span>
                <span className="text-gray-500 font-semibold">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Documents */}
        <div className="bg-gray-50 rounded-xl p-2 shadow flex flex-col gap-4 flex-1 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-800">Recent Documents</h2>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm table-auto border-collapse text-center">
              <thead className="bg-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-gray-600 uppercase tracking-wider border-b">Name</th>
                  <th className="px-6 py-3 text-gray-600 uppercase tracking-wider border-b">Uploaded By</th>
                  <th className="px-6 py-3 text-gray-600 uppercase tracking-wider border-b">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{doc.name}</td>
                    <td className="px-6 py-4 text-gray-700">{doc.uploadedBy}</td>
                    <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center flex-shrink-0">
          <button className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition font-medium">
            📄 Upload Document
          </button>
          <button className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg shadow hover:bg-green-600 transition font-medium">
            🏷️ Manage Tags
          </button>
          <button className="flex items-center justify-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow hover:bg-yellow-600 transition font-medium">
            ⚡ Review Documents
          </button>
      </div>

    </div>
  </main>

  );
}
