"use client";

import { useState, useEffect } from "react";
import api from '@/app/lib/axios';

export default function TagsPage() {
  const [tags, setTags] = useState<{ id: number; tag: string }[]>([]);
  const [newTag, setNewTag] = useState("");
  const API_URL = "/internal/tags";

  // Fetch tags from backend on mount
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await api.get(API_URL);
      setTags(res.data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const handleAddTag = async () => {
    if (!newTag) return;
    try {
      const res = await api.post(API_URL, { tag: newTag });
      setTags([...tags, res.data]); // append newly created tag
      setNewTag("");
    } catch (err) {
      console.error("Error adding tag:", err);
    }
  };

  // UPDATE (only change in local copy)
const handleUpdateTag = async (id: number) => {
  const name = prompt("Enter new tag name:");
  if (!name) return;
  try {
    await api.patch(`${API_URL}/${id}`, { tag: name });
    setTags(tags.map((tag) => (tag.id === id ? { ...tag, tag: name } : tag))); // update local only
  } catch (err) {
    console.error("Error updating tag:", err);
  }
};

// DELETE (filter local copy)
const handleDeleteTag = async (id: number) => {
  try {
    await api.delete(`${API_URL}/${id}`);
    setTags(tags.filter((tag) => tag.id !== id)); // remove from local
  } catch (err) {
    console.error("Error deleting tag:", err);
  }
};

  return (
    <main className="flex-1 bg-gray-100 h-screen overflow-hidden">
      <div className="mt-10 mb-20 p-6 h-full overflow-auto bg-white rounded-xl shadow flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Tags Management</h1>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag..."
              className="flex-1 md:flex-none px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddTag}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 hover:scale-105 transition transform duration-150 font-medium"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse table-auto text-center">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-gray-600 uppercase tracking-wider border-b">
                  ID
                </th>
                <th className="px-6 py-3 text-gray-600 uppercase tracking-wider border-b">
                  Tag Name
                </th>
                <th className="px-6 py-3 text-gray-600 uppercase tracking-wider border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tags?.map((tag) => (
                <tr
                  key={tag.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-700">{tag.id}</td>
                  <td className="px-6 py-4 text-gray-900">{tag.tag}</td>
                  <td className="px-6 py-4 flex gap-2 justify-center">
                    <button
                      className="bg-yellow-400 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-500 hover:scale-105 transition transform duration-150 font-medium"
                      onClick={() => handleUpdateTag(tag.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 hover:scale-105 transition transform duration-150 font-medium"
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No tags available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
