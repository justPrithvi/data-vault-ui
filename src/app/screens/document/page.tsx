// src/app/dashboard/overview/page.tsx
"use client";

import TableComponent from "@/components/TableComponent";
import { useAuth } from "@/context/AuthContext";
import UploadModal from "@/components/UploadModal";
import { usePageHeader } from "@/context/PageHeaderContext";
import { useCallback, useEffect, useState } from "react";
import api from "@/app/lib/axios";

export default function DocumentPage() {
  const { user, authContextLoading } = useAuth();
  const { setHeaderConfig, searchQuery } = usePageHeader();

  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Set header config for document page
  useEffect(() => {
    setHeaderConfig({
      icon: "📄",
      title: "Document Management",
      subtitle: "Manage and organize your files",
      searchPlaceholder: "Search documents...",
      onSearchChange: () => {
        setCurrentPage(1);
      },
      actionButton: {
        label: "Upload Document",
        icon: "📄",
        onClick: () => setShowModal(true),
      },
    });
  }, [setHeaderConfig]);

  // Fetch on mount, when page changes, or search query changes
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if(!authContextLoading && user) {
          // Admin users see all documents, regular users see only their own
          const userParam = user.isAdmin ? 'all' : user.email;
          const res = await api.get(`/documents/${userParam}`, {
            params: { page: currentPage, limit, search: searchQuery }
          });
          
          setRows(res.data.data || [])
          setTotal(res.data.meta?.total || 0)
          setTotalPages(res.data.meta?.totalPages || 1)
          setCurrentPage(res.data.meta?.page || 1)
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchDocuments();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(delayDebounce);
  }, [authContextLoading, user, currentPage, limit, searchQuery]);
  
  return (
    <>
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-full overflow-hidden flex flex-col">
      <div className="flex flex-col gap-2 lg:gap-3 h-full overflow-hidden">
        {/* Main Content Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg lg:rounded-xl shadow-2xl border border-slate-700 flex flex-col flex-1 overflow-hidden max-w-full">

        {/* Main content - Flexible */}
        <div className="flex flex-col lg:flex-row flex-1 gap-2 lg:gap-3 p-2 lg:p-3 overflow-hidden min-h-0">
          {/* Left Column: Documents Table */}
          <div className="flex-1 lg:flex-[0.7] bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col min-h-0 h-[675px] lg:h-full">
            {/* Table - With Scroll */}
            <div className="flex-1 overflow-hidden min-h-0">
              <TableComponent 
                rows={rows} 
                onRowClick={setSelectedDocument}
                selectedDocument={selectedDocument}
                isAdmin={user?.isAdmin}
              ></TableComponent>
            </div>
            
            {/* Pagination - Fixed at bottom */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-slate-900 border-t border-slate-700 flex-shrink-0">
                <div className="text-[10px] lg:text-xs text-slate-300 font-medium">
                  <span className="text-purple-400 font-semibold">{rows.length > 0 ? ((currentPage - 1) * limit + 1) : 0}</span>-<span className="text-purple-400 font-semibold">{Math.min(currentPage * limit, total)}</span> of <span className="text-purple-400 font-semibold">{total}</span>
                </div>
                
                <div className="flex items-center gap-1 lg:gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-slate-700 border border-slate-600 hover:border-purple-500 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[10px] lg:text-xs font-medium text-slate-200"
                  >
                    ←
                  </button>
                  
                  <div className="flex gap-0.5 lg:gap-1">
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                      let page;
                      if (totalPages <= 3) {
                        page = i + 1;
                      } else if (currentPage <= 2) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 1) {
                        page = totalPages - 2 + i;
                      } else {
                        page = currentPage - 1 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg transition-all text-[10px] lg:text-xs font-medium ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-lg'
                              : 'bg-slate-700 border border-slate-600 hover:border-purple-500 hover:bg-slate-600 text-slate-200'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-slate-700 border border-slate-600 hover:border-purple-500 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[10px] lg:text-xs font-medium text-slate-200"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Document Details */}
          <div className="flex-1 lg:flex-[0.3] flex flex-col lg:gap-3 overflow-y-auto lg:overflow-hidden max-h-[250px] lg:max-h-none">
            {selectedDocument ? (
              <div className="flex lg:flex-col gap-2 lg:gap-3">
                {/* Left: Details & Tags (Mobile: vertical, Desktop: full column) */}
                <div className="flex-1 lg:flex-none flex flex-col gap-2 lg:gap-3">
                  {/* Document Details */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2 lg:p-3 rounded-lg shadow-lg border border-indigo-700">
                    <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2.5 pb-1 lg:pb-2 border-b border-slate-700">
                      <div className="w-7 h-7 lg:w-9 lg:h-9 bg-gradient-to-br from-purple-600 to-pink-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-base lg:text-lg">📄</span>
                      </div>
                      <h2 className="text-xs lg:text-sm font-bold text-slate-100 truncate flex-1">{selectedDocument.fileName}</h2>
                    </div>
                    <dl className="space-y-1 lg:space-y-2 text-[10px] lg:text-xs">
                      <div className="flex justify-between items-center py-0.5 lg:py-1.5 border-b border-slate-700/50">
                        <dt className="text-slate-400 font-medium">File Type:</dt>
                        <dd className="text-slate-100 text-[9px] lg:text-[10px] font-semibold bg-indigo-900 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">{selectedDocument.fileType}</dd>
                      </div>
                      <div className="flex justify-between items-center py-1 lg:py-1.5 border-b border-slate-700/50">
                        <dt className="text-slate-400 font-medium">Size:</dt>
                        <dd className="text-slate-100 font-semibold">{(selectedDocument.size / 1024 / 1024).toFixed(2)} MB</dd>
                      </div>
                      <div className="flex justify-between items-center py-1 lg:py-1.5 border-b border-slate-700/50">
                        <dt className="text-slate-400 font-medium">Uploaded By:</dt>
                        <dd className="text-slate-100 font-semibold truncate max-w-[60%]">{selectedDocument.user?.name || 'Unknown'}</dd>
                      </div>
                      <div className="flex justify-between items-center py-1 lg:py-1.5">
                        <dt className="text-slate-400 font-medium">Upload Date:</dt>
                        <dd className="text-slate-100 font-semibold">{new Date(selectedDocument.createdAt).toLocaleDateString()}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Tags Container */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2 lg:p-3 rounded-lg shadow-lg border border-indigo-700">
                    <h2 className="text-[10px] lg:text-xs font-bold text-slate-100 mb-1 lg:mb-2 flex items-center gap-1">
                      <span>🏷️</span>
                      <span>Tags</span>
                    </h2>
                    <div className="flex flex-wrap gap-1 lg:gap-1.5">
                      {selectedDocument.tags && selectedDocument.tags.length > 0 ? (
                        selectedDocument.tags.map((tag: any) => (
                          <span key={tag.id} className="px-2 lg:px-2.5 py-1 lg:py-1.5 bg-gradient-to-r from-indigo-900 to-purple-900 text-indigo-300 rounded-lg font-semibold border border-indigo-700 text-[10px] lg:text-xs shadow-sm">
                            {tag.tag}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 lg:px-2.5 py-1 lg:py-1.5 bg-slate-700 text-slate-400 rounded-lg font-medium text-[10px] lg:text-xs">No tags</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Mobile: side column, Desktop: bottom of main column) */}
                <div className="lg:hidden w-20 flex flex-col gap-1">
                  <h2 className="text-[10px] font-bold text-slate-300 text-center mb-0.5">Actions</h2>
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={async () => {
                        setShowPreview(true);
                        setPreviewLoading(true);
                        try {
                          const response = await api.get(`/documents/download/${selectedDocument.id}`, {
                            responseType: 'blob'
                          });
                          const blob = new Blob([response.data], { type: selectedDocument.fileType });
                          const url = URL.createObjectURL(blob);
                          setPreviewUrl(url);
                        } catch (error) {
                          console.error('Error loading preview:', error);
                          alert('Failed to load preview');
                          setShowPreview(false);
                        } finally {
                          setPreviewLoading(false);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-2 py-3 rounded-lg shadow-md hover:shadow-xl transition-all text-xs flex flex-col items-center justify-center gap-0.5 group"
                      title="Preview">
                      <span className="text-xl group-hover:scale-110 transition-transform">👁️</span>
                      <span className="text-[9px]">Preview</span>
                    </button>
                    <button 
                      onClick={() => {
                        window.open(`http://localhost:5001/documents/download/${selectedDocument.id}`, '_blank');
                      }}
                      className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-2 py-3 rounded-lg shadow-md hover:shadow-xl transition-all text-xs flex flex-col items-center justify-center gap-0.5 group"
                      title="Download">
                      <span className="text-xl group-hover:scale-110 transition-transform">📥</span>
                      <span className="text-[9px]">Download</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this document?')) {
                          // TODO: Implement delete
                          console.log('Delete document:', selectedDocument.id);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold px-2 py-3 rounded-lg shadow-md hover:shadow-xl transition-all text-xs flex flex-col items-center justify-center gap-0.5 group"
                      title="Delete">
                      <span className="text-xl group-hover:scale-110 transition-transform">🗑️</span>
                      <span className="text-[9px]">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Desktop Actions - Below Details */}
                <div className="hidden lg:block bg-slate-800 p-2.5 lg:p-3 rounded-lg shadow-lg border border-slate-700">
                  <h2 className="text-[10px] lg:text-xs font-bold text-slate-100 mb-1.5 lg:mb-2 flex items-center gap-1">
                    <span>⚡</span>
                    <span>Actions</span>
                  </h2>
                  <div className="flex flex-col gap-1.5 lg:gap-2">
                    <button 
                      onClick={async () => {
                        setShowPreview(true);
                        setPreviewLoading(true);
                        try {
                          const response = await api.get(`/documents/download/${selectedDocument.id}`, {
                            responseType: 'blob'
                          });
                          const blob = new Blob([response.data], { type: selectedDocument.fileType });
                          const url = URL.createObjectURL(blob);
                          setPreviewUrl(url);
                        } catch (error) {
                          console.error('Error loading preview:', error);
                          alert('Failed to load preview');
                          setShowPreview(false);
                        } finally {
                          setPreviewLoading(false);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg shadow-md hover:shadow-xl transition-all text-[10px] lg:text-xs flex items-center justify-center gap-1.5">
                      <span>👁️</span>
                      <span>Preview</span>
                    </button>
                    <button 
                      onClick={() => {
                        window.open(`http://localhost:5001/documents/download/${selectedDocument.id}`, '_blank');
                      }}
                      className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg shadow-md hover:shadow-xl transition-all text-[10px] lg:text-xs flex items-center justify-center gap-1.5">
                      <span>📥</span>
                      <span>Download</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this document?')) {
                          // TODO: Implement delete
                          console.log('Delete document:', selectedDocument.id);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg shadow-md hover:shadow-xl transition-all text-[10px] lg:text-xs flex items-center justify-center gap-1.5">
                      <span>🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 p-4 lg:p-6 rounded-lg shadow-lg border border-slate-700 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                    <span className="text-2xl lg:text-3xl">👆</span>
                  </div>
                  <p className="text-slate-400 text-xs lg:text-sm font-medium">Select a document to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUploaded={() => {
          setCurrentPage(1); // Go to first page after upload
        }}
      />

      {/* Preview Modal */}
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👁️</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{selectedDocument.fileName}</h2>
                  <p className="text-xs text-slate-500">{selectedDocument.fileType}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPreview(false);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl('');
                  }
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-4">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-slate-600 font-medium">Loading preview...</p>
                </div>
              ) : previewUrl ? (
                selectedDocument.fileType.startsWith('image/') ? (
                  // Image Preview
                  <img
                    src={previewUrl}
                    alt={selectedDocument.fileName}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                ) : selectedDocument.fileType === 'application/pdf' ? (
                  // PDF Preview
                  <iframe
                    src={previewUrl}
                    className="w-full h-full rounded-lg border-2 border-slate-200"
                    title={selectedDocument.fileName}
                  />
                ) : selectedDocument.fileType.startsWith('text/') ? (
                  // Text Preview
                  <iframe
                    src={previewUrl}
                    className="w-full h-full bg-white rounded-lg border-2 border-slate-200 p-4"
                    title={selectedDocument.fileName}
                  />
                ) : selectedDocument.fileType.startsWith('video/') ? (
                  // Video Preview
                  <video
                    controls
                    className="max-w-full max-h-full rounded-lg shadow-lg"
                    src={previewUrl}
                  >
                    Your browser does not support video playback.
                  </video>
                ) : selectedDocument.fileType.startsWith('audio/') ? (
                  // Audio Preview
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-6xl">🎵</span>
                    </div>
                    <audio
                      controls
                      className="mx-auto"
                      src={previewUrl}
                    >
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                ) : (
                  // Unsupported file type
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-6xl">📄</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Preview Not Available</h3>
                    <p className="text-slate-600 mb-4">
                      This file type cannot be previewed in the browser.
                    </p>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewUrl;
                        link.download = selectedDocument.fileName;
                        link.click();
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Download to View
                    </button>
                  </div>
                )
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl('');
                  }
                }}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (previewUrl) {
                    const link = document.createElement('a');
                    link.href = previewUrl;
                    link.download = selectedDocument.fileName;
                    link.click();
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>📥</span>
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
