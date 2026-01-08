"use client";
import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { usePageHeader } from "@/context/PageHeaderContext";

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState<{ id: number; tag: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { setHeaderConfig } = usePageHeader();

  // Set header config for tags page
  useEffect(() => {
    setHeaderConfig({
      icon: "🏷️",
      title: "Manage Tags",
      subtitle: "Create and organize tags for your documents",
      searchPlaceholder: "Search tags...",
      onSearchChange: () => {},
    });
  }, [setHeaderConfig]);

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/screens/dashboard');
      return;
    }
    fetchTags();
  }, [user, router]);

  const fetchTags = async () => {
    try {
      const response = await api.get('/internal/tags');
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    setLoading(true);
    try {
      await api.post('/internal/tags', { tag: newTag });
      setNewTag("");
      fetchTags();
    } catch (error) {
      console.error("Error adding tag:", error);
      alert("Failed to add tag");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !editingTag.tag.trim()) return;

    setLoading(true);
    try {
      await api.patch(`/internal/tags/${editingTag.id}`, {
        tag: editingTag.tag,
      });
      setEditingTag(null);
      fetchTags();
    } catch (error) {
      console.error("Error updating tag:", error);
      alert("Failed to update tag");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    setLoading(true);
    try {
      await api.delete(`/internal/tags/${id}`);
      fetchTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      alert("Failed to delete tag");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-full overflow-hidden flex flex-col">
      <div className="flex flex-col gap-2 lg:gap-3 h-full overflow-hidden">
        {/* Add Tag Section */}
        <div className="bg-slate-800 backdrop-blur-sm rounded-lg border border-indigo-700 p-2 lg:p-2.5 shadow-xl flex-shrink-0">
          <label className="block text-[10px] lg:text-xs font-medium text-slate-200 mb-1.5 lg:mb-2">Add New Tag</label>
          <div className="flex gap-1 lg:gap-1.5">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name..."
              className="flex-1 px-2 lg:px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all text-xs"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button
              onClick={handleAddTag}
              disabled={loading || !newTag.trim()}
              className="px-3 lg:px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs flex-shrink-0"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        {/* Tags Table */}
        <div className="bg-slate-800 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden shadow-xl flex-1 flex flex-col min-h-0">
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-indigo-700 to-purple-700 border-b border-indigo-600">
                  <th className="px-2 lg:px-3 py-1.5 lg:py-2 text-left text-[10px] lg:text-xs font-semibold text-white uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-2 lg:px-3 py-1.5 lg:py-2 text-left text-[10px] lg:text-xs font-semibold text-white uppercase tracking-wider">
                    Tag Name
                  </th>
                  <th className="px-2 lg:px-3 py-1.5 lg:py-2 text-right text-[10px] lg:text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {tags.map((tag, index) => (
                  <tr key={tag.id} className="hover:bg-indigo-900/20 transition-colors">
                    <td className="px-2 lg:px-3 py-1.5 lg:py-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-[10px] lg:text-xs font-medium">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-2 lg:px-3 py-1.5 lg:py-2">
                      {editingTag?.id === tag.id && editingTag ? (
                        <input
                          type="text"
                          value={editingTag.tag}
                          onChange={(e) => setEditingTag({ ...editingTag, tag: e.target.value })}
                          className="px-2 py-1 lg:py-1.5 bg-slate-700 border border-indigo-500 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full max-w-md text-xs"
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateTag()}
                        />
                      ) : (
                        <span className="inline-flex items-center px-2 lg:px-2.5 py-1 lg:py-1.5 rounded-lg bg-gradient-to-r from-indigo-900 to-purple-900 text-indigo-300 font-medium border border-indigo-700 text-[10px] lg:text-xs">
                          {tag.tag}
                        </span>
                      )}
                    </td>
                    <td className="px-2 lg:px-3 py-1.5 lg:py-2 text-right">
                      <div className="flex justify-end gap-1">
                        {editingTag?.id === tag.id ? (
                          <>
                            <button
                              onClick={handleUpdateTag}
                              disabled={loading}
                              className="px-2 lg:px-2.5 py-1 lg:py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-[10px] lg:text-xs font-medium hover:shadow-lg disabled:opacity-50 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTag(null)}
                              disabled={loading}
                              className="px-2 lg:px-2.5 py-1 lg:py-1.5 bg-slate-700 text-slate-200 rounded-lg text-[10px] lg:text-xs font-medium hover:bg-slate-600 disabled:opacity-50 transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingTag({ id: tag.id, tag: tag.tag })}
                              disabled={loading}
                              className="px-2 lg:px-2.5 py-1 lg:py-1.5 bg-indigo-900 text-indigo-300 border border-indigo-700 rounded-lg text-[10px] lg:text-xs font-medium hover:bg-indigo-800 disabled:opacity-50 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag.id)}
                              disabled={loading}
                              className="px-2 lg:px-2.5 py-1 lg:py-1.5 bg-purple-900 text-purple-300 border border-purple-700 rounded-lg text-[10px] lg:text-xs font-medium hover:bg-purple-800 disabled:opacity-50 transition-all"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tags.length === 0 && (
              <div className="text-center py-8 lg:py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-indigo-900 mb-2 lg:mb-3">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-xs lg:text-sm">No tags yet. Create your first tag above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsPage;

