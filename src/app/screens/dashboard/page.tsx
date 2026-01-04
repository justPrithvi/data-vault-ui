"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { useRouter } from "next/navigation";
import { usePageHeader } from "@/context/PageHeaderContext";

interface Tag {
  id: number;
  tag: string;
}

interface Document {
  id: number;
  fileName: string;
  fileType: string;
  size: number;
  user: { name: string };
  tags: Tag[];
  createdAt: string;
}

export default function DashboardPage() {
  const { user, authContextLoading } = useAuth();
  const router = useRouter();
  const { setHeaderConfig, searchQuery } = usePageHeader();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string; message: string}[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const docsPerPage = 5;

  // Set header config for dashboard - only once on mount
  useEffect(() => {
    setHeaderConfig({
      icon: "📊",
      title: "Welcome, ",
      titleHighlight: user?.name || 'User',
      subtitle: "Browse and chat with your documents",
      searchPlaceholder: "Search documents...",
      onSearchChange: () => {
        setCurrentPage(1);
      },
    });
  }, [user?.name, setHeaderConfig]);

  useEffect(() => {
    const fetchData = async () => {
      if (!authContextLoading && user) {
        try {
          // Admin users see all documents, regular users see only their own
          const userParam = user.isAdmin ? 'all' : user.email;
          const [docsRes, tagsRes] = await Promise.all([
            api.get(`/documents/${userParam}`, { params: { limit: 1000 } }),
            api.get('/internal/tags'),
          ]);
          
          setDocuments(docsRes.data.data || []);
          setTags(tagsRes.data || []);
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [authContextLoading, user]);

  // Filter documents by selected tag and search query
  const filteredDocuments = documents.filter(doc => {
    const matchesTag = selectedTag ? doc.tags?.some(tag => tag.id === selectedTag) : true;
    const matchesSearch = searchQuery 
      ? doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesTag && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / docsPerPage);
  const paginatedDocs = filteredDocuments.slice(
    (currentPage - 1) * docsPerPage,
    currentPage * docsPerPage
  );

  // Calculate document counts by tag
  const tagCounts = tags.map(tag => ({
    ...tag,
    count: documents.filter(doc => doc.tags?.some(t => t.id === tag.id)).length
  }));

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setChatOpen(true);
    setChatHistory([
      { role: "system", message: `Chat started for document: ${doc.fileName}` }
    ]);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory([...chatHistory, 
      { role: "user", message: chatMessage },
      { role: "assistant", message: "This is a mock response. Python service will be integrated later." }
    ]);
    setChatMessage("");
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-full overflow-hidden flex flex-col gap-4">

        {/* Tag Filter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 flex-shrink-0">
          <div
            onClick={() => { setSelectedTag(null); setCurrentPage(1); }}
            className={`cursor-pointer p-3 rounded-lg transition-all duration-300 border-2 ${
              selectedTag === null
                ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-indigo-500 shadow-lg scale-[1.02]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="text-lg">📊</div>
              <div className={`text-xl font-bold ${selectedTag === null ? 'text-white' : 'text-indigo-400'}`}>
                {documents.length}
              </div>
            </div>
            <div className="text-xs font-semibold opacity-90 mt-0.5">All Documents</div>
          </div>
          
          {tagCounts.map(tag => (
            <div
              key={tag.id}
              onClick={() => { setSelectedTag(tag.id); setCurrentPage(1); }}
              className={`cursor-pointer p-3 rounded-lg transition-all duration-300 border-2 ${
                selectedTag === tag.id
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-indigo-500 shadow-lg scale-[1.02]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="text-lg">🏷️</div>
                <div className={`text-xl font-bold ${selectedTag === tag.id ? 'text-white' : 'text-indigo-400'}`}>
                  {tag.count}
                </div>
              </div>
              <div className="text-xs font-semibold opacity-90 truncate mt-0.5">{tag.tag}</div>
            </div>
          ))}
        </div>

        {/* Documents Grid & Chat */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 overflow-hidden">
          {/* Documents Section */}
          <div className="lg:col-span-1 bg-slate-800 rounded-xl shadow-xl border border-slate-700 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-100">
                {selectedTag ? `${tagCounts.find(t => t.id === selectedTag)?.tag} Documents` : 'All Documents'}
              </h2>
              <span className="px-2.5 py-1 bg-indigo-600 text-indigo-100 rounded-full text-xs font-semibold">
                {filteredDocuments.length} total
              </span>
      </div>

            <div className="flex-1 p-4 overflow-hidden">
          {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              ) : paginatedDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-4xl">📭</span>
                  </div>
                  <p className="text-slate-400 font-medium">No documents found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5">
                  {paginatedDocs.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className="group cursor-pointer p-1.5 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border-2 border-slate-600 hover:border-indigo-500 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-100 truncate group-hover:text-indigo-400 transition-colors text-sm leading-tight">
                            {doc.fileName}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {doc.tags && doc.tags.length > 0 ? (
                              doc.tags.map((tag) => (
                                <span key={tag.id} className="text-xs px-1.5 py-0.5 bg-indigo-900 text-indigo-300 rounded font-medium leading-tight">
                                  {tag.tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500">No tags</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 leading-tight">
                            <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-1.5 px-4 py-2 bg-slate-900 border-t border-slate-700 flex-shrink-0">
                <div className="text-xs text-slate-400 text-center">
                  <span className="text-indigo-400 font-semibold">{paginatedDocs.length > 0 ? ((currentPage - 1) * docsPerPage + 1) : 0}</span>-<span className="text-indigo-400 font-semibold">{Math.min(currentPage * docsPerPage, filteredDocuments.length)}</span> of <span className="text-indigo-400 font-semibold">{filteredDocuments.length}</span>
                </div>
                
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-0.5 rounded bg-slate-700 border border-slate-600 hover:border-indigo-500 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium text-slate-300"
                  >
                    ←
                  </button>
                  
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2.5 py-0.5 rounded transition-all text-xs font-medium ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-sm'
                              : 'bg-slate-700 border border-slate-600 hover:border-indigo-500 hover:bg-slate-600 text-slate-300'
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
                    className="px-2 py-0.5 rounded bg-slate-700 border border-slate-600 hover:border-indigo-500 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium text-slate-300"
                  >
                    →
                  </button>
                </div>
              </div>
          )}
        </div>

          {/* Chat Section */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-700">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>💬</span>
                <span>Document Chat</span>
              </h2>
            </div>

            {chatOpen && selectedDocument ? (
              <>
                <div className="px-4 py-2.5 border-b border-slate-700 bg-slate-900">
                  <p className="text-xs text-slate-300 font-medium truncate">
                    📄 {selectedDocument.fileName}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white'
                            : msg.role === 'system'
                            ? 'bg-slate-700 text-slate-300 text-xs italic'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about this document..."
                      className="flex-1 px-4 py-2 border-2 border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-700 text-slate-100 placeholder-slate-400 text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                    >
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    ⚠️ Python service integration pending
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                  Start a Conversation
                </h3>
                <p className="text-sm text-slate-400">
                  Click on a document to start chatting about it
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
