"use client";
import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState<{ id: number; tag: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900/10 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Manage Tags
          </h1>
          <p className="text-slate-400">Create and organize tags for your documents</p>
        </div>

        {/* Add Tag Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-green-500/20 p-6 mb-8 shadow-xl">
          <label className="block text-sm font-medium text-slate-200 mb-3">Add New Tag</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name..."
              className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button
              onClick={handleAddTag}
              disabled={loading || !newTag.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Adding..." : "Add Tag"}
            </button>
          </div>
        </div>

        {/* Tags Table */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-green-500/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-green-500/20">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Tag Name
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {tags.map((tag, index) => (
                  <tr key={tag.id} className="hover:bg-green-500/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-white text-sm font-medium">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingTag?.id === tag.id && editingTag ? (
                        <input
                          type="text"
                          value={editingTag.tag}
                          onChange={(e) => setEditingTag({ ...editingTag, tag: e.target.value })}
                          className="px-3 py-2 bg-slate-900/50 border border-green-500 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 w-full max-w-md"
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateTag()}
                        />
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 font-medium border border-green-500/20">
                          {tag.tag}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingTag?.id === tag.id ? (
                          <>
                            <button
                              onClick={handleUpdateTag}
                              disabled={loading}
                              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTag(null)}
                              disabled={loading}
                              className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-600 disabled:opacity-50 transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingTag({ id: tag.id, tag: tag.tag })}
                              disabled={loading}
                              className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-medium hover:bg-blue-600/30 disabled:opacity-50 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag.id)}
                              disabled={loading}
                              className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-600/30 disabled:opacity-50 transition-all"
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
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600/20 mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <p className="text-slate-400">No tags yet. Create your first tag above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsPage;

