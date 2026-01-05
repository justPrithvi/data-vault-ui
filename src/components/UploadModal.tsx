"use client";
import { useEffect, useState } from "react";
import { uploadDocumentToNest, getTags } from "../app/lib/nestApi";
import { uploadDocumentToPython } from "../app/lib/pythonApi";
import { useAuth } from "@/context/AuthContext";

interface Tag {
  id: number;
  tag: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void; // callback to refresh table
}

const UploadModal = ({ isOpen, onClose, onUploaded }: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch tags on mount
  useEffect(() => {
    getTags()
      .then((data: any) => setTags(data))
      .catch((err: any) => console.error("Error fetching tags:", err));
  }, []);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null); // clear error if user selects file
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }

    if (selectedTagIds.length === 0) {
      setError("Please select at least one tag. This field is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload file to NestJS server
      const nestResponse = await uploadDocumentToNest(file, selectedTagIds);

      console.log("NestJS upload response:", nestResponse.data);

      // Only send to Python service if NestJS upload was successful
      if (nestResponse.status === 200 || nestResponse.status === 201) {
        try {
          // Extract document ID from NestJS response (response is the document object with id)
          const documentId = nestResponse.data.id;
          
          if (documentId) {
            const pythonData = await uploadDocumentToPython(file, documentId);
            console.log("Python service response:", pythonData);
          } else {
            console.error("Document ID not found in NestJS response");
          }
        } catch (pythonErr) {
          console.error("Python service upload failed:", pythonErr);
          // Don't fail the overall upload if Python service fails
        }
      }

      setLoading(false);
      setFile(null);
      setSelectedTagIds([]);
      onUploaded();
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-[500px] border-2 border-purple-200 animate-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📤</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Upload Document
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a file and add tags</p>
          </div>
        </div>

        {/* File input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Choose File</label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border-2 border-dashed border-purple-300 rounded-xl px-4 py-8 text-sm bg-purple-50/50 hover:bg-purple-50 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-600 file:text-white hover:file:scale-105 file:transition-transform"
            />
            {file && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-700 font-medium truncate">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-red-600 text-sm font-medium flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Tags selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Tags <span className="text-red-500">*</span> (Select at least one)
          </label>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-lg">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600 shadow-lg scale-105"
                      : "bg-white text-slate-700 border-slate-200 hover:border-purple-400 hover:bg-purple-50"
                  }`}
                >
                  {selectedTagIds.includes(tag.id) && <span className="mr-1">✓</span>}
                  {tag.tag}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg">No tags available. Please create one first.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            className="px-6 py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-all hover:scale-105"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center gap-2"
            onClick={handleUpload}
            disabled={loading || !file || selectedTagIds.length === 0}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
