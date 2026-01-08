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
  const [mobileView, setMobileView] = useState<'documents' | 'chat'>('documents');

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
    // Switch to chat view on mobile
    setMobileView('chat');
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
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-full overflow-hidden flex flex-col gap-2 lg:gap-3 min-h-0">

        {/* Tag Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1.5 lg:gap-2 flex-shrink-0">
          <div
            onClick={() => { setSelectedTag(null); setCurrentPage(1); }}
            className={`cursor-pointer p-2 lg:p-2.5 rounded-lg transition-all duration-300 border ${
              selectedTag === null
                ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-indigo-500 shadow-lg'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-1.5 lg:gap-2">
              <div className="text-base lg:text-lg flex-shrink-0">📊</div>
              <div className={`text-base lg:text-lg font-bold ${selectedTag === null ? 'text-white' : 'text-indigo-400'}`}>
                {documents.length}
              </div>
            </div>
            <div className="text-[10px] lg:text-xs font-semibold opacity-90 mt-0.5 truncate">All Documents</div>
          </div>
          
          {tagCounts.map(tag => (
            <div
              key={tag.id}
              onClick={() => { setSelectedTag(tag.id); setCurrentPage(1); }}
              className={`cursor-pointer p-2 lg:p-2.5 rounded-lg transition-all duration-300 border ${
                selectedTag === tag.id
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-indigo-500 shadow-lg'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="text-base lg:text-lg flex-shrink-0">🏷️</div>
                <div className={`text-base lg:text-lg font-bold ${selectedTag === tag.id ? 'text-white' : 'text-indigo-400'}`}>
                  {tag.count}
                </div>
              </div>
              <div className="text-[10px] lg:text-xs font-semibold opacity-90 truncate mt-0.5">{tag.tag}</div>
            </div>
          ))}
        </div>

        {/* Mobile View Tabs */}
        <div className="lg:hidden flex gap-2 bg-slate-800/50 p-1 rounded-lg flex-shrink-0">
          <button
            onClick={() => setMobileView('documents')}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
              mobileView === 'documents'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📄 Documents ({filteredDocuments.length})
          </button>
          <button
            onClick={() => setMobileView('chat')}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
              mobileView === 'chat'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💬 Chat {selectedDocument ? '(Active)' : ''}
          </button>
        </div>

        {/* Documents Grid & Chat */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-2 lg:gap-3 overflow-hidden min-h-0">
          {/* Documents Section */}
          <div className={`lg:col-span-1 bg-slate-800 rounded-lg shadow-xl border border-slate-700 flex flex-col min-h-0 lg:h-full ${
            mobileView === 'documents' ? 'flex' : 'hidden lg:flex'
          }`}>
            <div className="px-2.5 lg:px-3 py-2 lg:py-2.5 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xs lg:text-sm font-bold text-slate-100 truncate">
                {selectedTag ? `${tagCounts.find(t => t.id === selectedTag)?.tag} Docs` : 'All Documents'}
              </h2>
              <span className="px-2 py-0.5 bg-indigo-600 text-indigo-100 rounded-full text-[10px] lg:text-xs font-semibold flex-shrink-0">
                {filteredDocuments.length}
              </span>
      </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-2 lg:p-3" style={{maxHeight: 'calc(100% - 100px)'}}>
          {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              ) : paginatedDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 lg:gap-3">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl lg:text-3xl">📭</span>
                  </div>
                  <p className="text-slate-400 font-medium text-xs lg:text-sm">No documents found</p>
                </div>
              ) : (
                <div className="space-y-2 lg:space-y-5.5">
                  {paginatedDocs.map(doc => {
                    const isSelected = selectedDocument?.id === doc.id;
                    return (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className={`group cursor-pointer p-1.5 lg:p-2 rounded-lg border transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-500 shadow-lg'
                          : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 hover:border-indigo-500 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start gap-1.5 lg:gap-2">
                        <div className="w-6 h-6 lg:w-7 lg:h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-xs lg:text-sm">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold truncate transition-colors text-xs lg:text-sm leading-tight ${
                            isSelected ? 'text-white' : 'text-slate-100 group-hover:text-indigo-400'
                          }`}>
                            {doc.fileName}
                          </h3>
                          <div className="flex flex-wrap gap-0.5 lg:gap-1 mt-0.5">
                            {doc.tags && doc.tags.length > 0 ? (
                              doc.tags.slice(0, 2).map((tag) => (
                                <span key={tag.id} className={`text-[9px] lg:text-[10px] px-1 lg:px-1.5 py-0.5 rounded font-medium leading-tight ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-indigo-900 text-indigo-300'
                                }`}>
                                  {tag.tag}
                                </span>
                              ))
                            ) : (
                              <span className={`text-[9px] lg:text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>No tags</span>
                            )}
                            {doc.tags && doc.tags.length > 2 && (
                              <span className={`text-[9px] lg:text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>+{doc.tags.length - 2}</span>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 lg:gap-1.5 mt-0.5 text-[9px] lg:text-[10px] leading-tight ${
                            isSelected ? 'text-indigo-200' : 'text-slate-400'
                          }`}>
                            <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-1 px-2 lg:px-3 py-1.5 lg:py-2 bg-slate-900 border-t border-slate-700 flex-shrink-0">
                <div className="text-[10px] lg:text-xs text-slate-400 text-center">
                  <span className="text-indigo-400 font-semibold">{paginatedDocs.length > 0 ? ((currentPage - 1) * docsPerPage + 1) : 0}</span>-<span className="text-indigo-400 font-semibold">{Math.min(currentPage * docsPerPage, filteredDocuments.length)}</span> of <span className="text-indigo-400 font-semibold">{filteredDocuments.length}</span>
                </div>
                
                <div className="flex items-center justify-center gap-0.5 lg:gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-1.5 lg:px-2 py-0.5 rounded bg-slate-700 border border-slate-600 hover:border-indigo-500 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[10px] lg:text-xs font-medium text-slate-300"
                  >
                    ←
                  </button>
                  
                  <div className="flex gap-0.5">
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
                          className={`px-2 lg:px-2.5 py-0.5 rounded transition-all text-[10px] lg:text-xs font-medium ${
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
                    className="px-1.5 lg:px-2 py-0.5 rounded bg-slate-700 border border-slate-600 hover:border-indigo-500 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[10px] lg:text-xs font-medium text-slate-300"
                  >
                    →
                  </button>
                </div>
              </div>
          )}
        </div>

          {/* Chat Section */}
          <div className={`lg:col-span-3 bg-slate-800 rounded-lg shadow-xl border border-slate-700 flex flex-col overflow-hidden min-h-0 ${
            mobileView === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}>
            <div className="px-2.5 lg:px-3 py-2 lg:py-2.5 border-b border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-700 flex-shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileView('documents')}
                  className="lg:hidden text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                  aria-label="Back to documents"
                >
                  <span className="text-lg">←</span>
                </button>
                <h2 className="text-xs lg:text-sm font-bold text-white flex items-center gap-1.5 lg:gap-2">
                  <span className="text-sm lg:text-base">💬</span>
                  <span>Document Chat</span>
                </h2>
              </div>
            </div>

            {chatOpen && selectedDocument ? (
              <>
                <div className="px-2.5 lg:px-3 py-1.5 lg:py-2 border-b border-slate-700 bg-slate-900 flex-shrink-0">
                  <p className="text-[10px] lg:text-xs text-slate-300 font-medium truncate">
                    📄 {selectedDocument.fileName}
                  </p>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-2 lg:p-3 space-y-1.5 lg:space-y-2 bg-slate-900">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white'
                            : msg.role === 'system'
                            ? 'bg-slate-700 text-slate-300 text-[10px] lg:text-xs italic'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-1.5 lg:p-2 border-t border-slate-700 bg-slate-800 flex-shrink-0">
                  <div className="flex gap-1 lg:gap-1.5">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about this document..."
                      className="flex-1 px-2 lg:px-2.5 py-1.5 border border-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-700 text-slate-100 placeholder-slate-400 text-xs"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-2.5 lg:px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-xs"
                    >
                      Send
                    </button>
                  </div>
                  
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 text-center bg-slate-900">
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full flex items-center justify-center mb-2 lg:mb-3">
                  <span className="text-2xl lg:text-3xl">💬</span>
                </div>
                <h3 className="text-sm lg:text-base font-semibold text-slate-200 mb-1 lg:mb-2">
                  Start a Conversation
                </h3>
                <p className="text-xs lg:text-sm text-slate-400">
                  Click on a document to start chatting about it
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
