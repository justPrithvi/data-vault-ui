"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/context/PageHeaderContext";
import { sendChatMessage, getConversations, getConversationHistory } from "@/app/lib/pythonApi";

interface Conversation {
  conversationId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: {
    role: string;
    content: string;
    timestamp: string;
  };
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { setHeaderConfig, searchQuery } = usePageHeader();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [showConversationList, setShowConversationList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Cache for conversation messages - prevents re-fetching when switching back
  const conversationCache = useRef<Record<string, Message[]>>({});

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set header config for chat page
  useEffect(() => {
    setHeaderConfig({
      icon: "💬",
      title: "AI Chat Assistant",
      subtitle: "Ask questions about your documents",
      searchPlaceholder: "Search conversations...",
      onSearchChange: () => {},
    });
  }, [setHeaderConfig]);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingConversations(true);
        const response = await getConversations(user.id);
        setConversations(response.conversations || []);
      } catch (error) {
        console.error("Failed to load conversations:", error);
        // Show empty state on error
        setConversations([]);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user?.id]);

  // Load conversation history when selected
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (selectedConversation) {
        // Check if we have cached messages for this conversation
        if (conversationCache.current[selectedConversation]) {
          console.log('Using cached messages for conversation:', selectedConversation);
          setMessages(conversationCache.current[selectedConversation]);
          return;
        }

        // Fetch from backend if not cached
        try {
          setIsLoading(true);
          const historyData = await getConversationHistory(selectedConversation);
          
          console.log('Fetched conversation history from backend:', historyData);
          
          // Convert backend messages to frontend format
          if (historyData.messages && Array.isArray(historyData.messages)) {
            const formattedMessages: Message[] = historyData.messages.map((msg: any, idx: number) => ({
              id: Date.now() + idx,
              role: msg.role,
              content: msg.content,
              timestamp: new Date().toISOString(),
            }));
            
            // Cache the messages
            conversationCache.current[selectedConversation] = formattedMessages;
            setMessages(formattedMessages);
          }
        } catch (error) {
          console.error('Failed to load conversation history:', error);
          // Show error message
          setMessages([
            {
              id: Date.now(),
              role: 'assistant',
              content: '⚠️ Failed to load conversation history. Please try again.',
              timestamp: new Date().toISOString(),
            }
          ]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadConversationHistory();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Ensure user is authenticated
    if (!user?.id) {
      console.error("User not authenticated");
      alert("Please log in to send messages");
      return;
    }

    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    // Optimistically add user message to UI
    const tempUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: currentInput,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => {
      const updated = [...prev, tempUserMessage];
      
      // Update cache with user message
      if (selectedConversation) {
        conversationCache.current[selectedConversation] = updated;
      }
      
      return updated;
    });

    try {
      // Call Python AI service endpoint
      // Backend returns full conversation history in 'messages' array
      const response = await sendChatMessage(
        currentInput,
        selectedConversation, // null for new conversations
        user.id.toString()
      );

      console.log('Full response from backend:', response);

      // If this was a new conversation, update the selectedConversation with the returned ID
      if (!selectedConversation && response.conversationId) {
        setSelectedConversation(response.conversationId);
        
        // Refresh the conversations list to include the new conversation
        if (user?.id) {
          const updatedConversations = await getConversations(user.id);
          setConversations(updatedConversations.conversations || []);
        }
      } else if (selectedConversation) {
        // Update the conversation in the list
        setConversations(prev =>
          prev.map(conv =>
            conv.conversationId === selectedConversation
              ? {
                  ...conv,
                  lastMessage: {
                    role: 'assistant',
                    content: response.response || '',
                    timestamp: new Date().toISOString(),
                  },
                  updatedAt: new Date().toISOString(),
                  messageCount: response.messages?.length || conv.messageCount + 2,
                }
              : conv
          )
        );
      }

      // Append only the assistant's response to existing messages
      // We already added the user message optimistically above
      const assistantMessage: Message = {
        id: Date.now() + 1, // Unique ID
        role: 'assistant',
        content: response.response || 'Response received successfully.',
        timestamp: new Date().toISOString(),
      };
      
      console.log('Assistant response:', assistantMessage.content);
      
      // Append assistant message to existing state (maintain history)
      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        
        // Update cache with new messages
        const convId = selectedConversation || response.conversationId;
        if (convId) {
          conversationCache.current[convId] = updated;
          console.log(`✅ Cached ${updated.length} messages for conversation:`, convId);
        }
        
        return updated;
      });
    } catch (error: any) {
      // Handle errors and display them as assistant messages
      let errorMessage = 'Sorry, I encountered an error processing your request.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 404) {
          errorMessage = '⚠️ AI Service Not Found (404)\n\nThe Python AI service endpoint is not yet configured. Please set up the AI service and try again.';
        } else if (status === 500) {
          errorMessage = `⚠️ Server Error (${status})\n\n${errorData.message || 'Internal server error occurred. Please try again later.'}`;
        } else if (status === 503) {
          errorMessage = '⚠️ Service Unavailable (503)\n\nThe AI service is currently unavailable. Please try again later.';
        } else {
          errorMessage = `⚠️ Error (${status})\n\n${errorData.message || errorData.error || 'An error occurred while processing your request.'}`;
        }
      } else if (error.request) {
        // Request made but no response received
        errorMessage = '⚠️ Connection Error\n\nUnable to connect to the AI service. Please check if the Python service is running.';
      } else {
        // Something else happened
        errorMessage = `⚠️ Error\n\n${error.message || 'An unexpected error occurred.'}`;
      }

      const errorMessageObj: Message = {
        id: Date.now(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
      };
      
      console.log('Error message:', errorMessageObj);
      setMessages(prev => {
        const updated = [...prev, errorMessageObj];
        
        // Update cache with error message
        if (selectedConversation) {
          conversationCache.current[selectedConversation] = updated;
        }
        
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    // Start a new conversation (conversationId will be null until first message is sent)
    setSelectedConversation(null);
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you with your documents today?',
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-full overflow-hidden flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-1.5 lg:gap-2 overflow-hidden">
        {/* Left Panel: Conversations List (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-1 bg-slate-800/80 rounded-lg border border-slate-700/50 flex-col overflow-hidden backdrop-blur-sm">
          {/* Header with New Chat Button */}
          <div className="px-2 lg:px-2.5 py-1.5 lg:py-2 border-b border-slate-700/30 flex justify-between items-center bg-slate-800/50">
            <h2 className="text-xs lg:text-sm font-semibold text-slate-300 flex items-center gap-1 lg:gap-1.5 uppercase tracking-wider">
              <span className="text-sm lg:text-base">💬</span>
              <span>Chats</span>
            </h2>
            <button
              onClick={handleNewChat}
              className="px-1.5 lg:px-2 py-0.5 lg:py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] lg:text-xs font-medium transition-all shadow-sm"
              title="Start new conversation"
            >
              + New
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-1 lg:p-1.5 bg-slate-900/50">
            {isLoadingConversations ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-5 h-5 lg:w-6 lg:h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-2 lg:px-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-800 rounded-lg flex items-center justify-center mb-1.5 lg:mb-2">
                  <span className="text-lg lg:text-xl">💬</span>
                </div>
                <p className="text-slate-400 text-[10px] lg:text-xs">No conversations</p>
              </div>
            ) : (
              <div className="space-y-0.5 lg:space-y-1">
                {filteredConversations.map((conv) => {
                  const isActive = selectedConversation === conv.conversationId;
                  return (
                    <div
                      key={conv.conversationId}
                      onClick={() => setSelectedConversation(conv.conversationId)}
                      className={`group relative px-2 lg:px-2.5 py-1.5 lg:py-2 rounded cursor-pointer transition-all ${
                        isActive
                          ? 'bg-indigo-600/20 shadow-sm'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 lg:h-8 bg-indigo-500 rounded-r"></div>
                      )}
                      
                      <div className="flex items-start gap-1.5 lg:gap-2">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6 rounded flex items-center justify-center text-xs mt-0.5 ${
                          isActive 
                            ? 'bg-indigo-600/30 text-indigo-300' 
                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                        }`}>
                          💬
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-[10px] lg:text-xs truncate mb-0.5 ${
                            isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {conv.title}
                          </h3>
                          <p className="text-[9px] lg:text-[10px] text-slate-500 truncate leading-tight line-clamp-1">
                            {conv.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="col-span-1 lg:col-span-3 bg-slate-800/80 rounded-lg border border-slate-700/50 flex flex-col overflow-hidden backdrop-blur-sm relative">
          {/* Mobile Conversation List Overlay */}
          {showConversationList && (
            <div className="lg:hidden absolute inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowConversationList(false)}>
              <div 
                className="w-[85%] max-w-sm h-full bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl border-r border-slate-700 animate-in slide-in-from-left duration-300" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
                    <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                      <span className="text-lg">💬</span>
                      <span>Conversations</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleNewChat();
                          setShowConversationList(false);
                        }}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-all shadow-lg"
                      >
                        + New
                      </button>
                      <button
                        onClick={() => setShowConversationList(false)}
                        className="text-slate-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto p-3 bg-slate-900/30">
                    {isLoadingConversations ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                          <span className="text-3xl">💬</span>
                        </div>
                        <p className="text-slate-300 text-sm font-medium mb-1">No conversations yet</p>
                        <p className="text-slate-500 text-xs">Start a new chat to begin</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {filteredConversations.map((conv) => {
                          const isActive = selectedConversation === conv.conversationId;
                          return (
                            <div
                              key={conv.conversationId}
                              onClick={() => {
                                setSelectedConversation(conv.conversationId);
                                setShowConversationList(false);
                              }}
                              className={`group relative px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                                isActive
                                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/50 shadow-md'
                                  : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-700'
                              }`}
                            >
                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-indigo-500 rounded-r"></div>
                              )}
                              
                              <div className="flex items-start gap-2.5">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm mt-0.5 ${
                                  isActive 
                                    ? 'bg-indigo-600/40 text-indigo-200' 
                                    : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                                }`}>
                                  💬
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-semibold text-sm truncate mb-1 ${
                                    isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                                  }`}>
                                    {conv.title}
                                  </h3>
                                  <p className="text-xs text-slate-400 truncate leading-tight">
                                    {conv.lastMessage.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {messages.length > 0 ? (
            <>
              {/* Chat Header */}
              <div className="px-2 lg:px-2.5 py-1.5 lg:py-2 border-b border-slate-700/30 bg-slate-800/50 flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Show conversations button on mobile */}
                  <button
                    onClick={() => setShowConversationList(true)}
                    className="lg:hidden text-slate-300 hover:text-white transition-colors"
                    title="Show conversations"
                  >
                    <span className="text-lg">☰</span>
                  </button>
                  <h2 className="text-xs lg:text-sm font-semibold text-slate-300 flex items-center gap-1 lg:gap-1.5 uppercase tracking-wider">
                    <span className="text-sm lg:text-base">🤖</span>
                    <span>Assistant</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConversation && (
                    <span className="text-[9px] lg:text-[10px] text-slate-500 font-medium">
                      {conversations.find(c => c.conversationId === selectedConversation)?.messageCount || 0} msgs
                    </span>
                  )}
                  <button
                    onClick={handleNewChat}
                    className="lg:hidden px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-medium transition-all"
                    title="New chat"
                  >
                    + New
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 min-h-0 overflow-y-auto px-2 lg:px-3 py-2 lg:py-3 space-y-1.5 lg:space-y-2 bg-slate-900/50">
                {messages.map((msg) => {
                  const isError = msg.role === 'assistant' && msg.content.startsWith('⚠️');
                  const isUser = msg.role === 'user';
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-1.5 lg:gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar for assistant */}
                      {!isUser && (
                        <div className="flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] lg:text-xs mt-0.5">
                          🤖
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] px-2 lg:px-2.5 py-1.5 rounded-lg ${
                          isUser
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : isError
                            ? 'bg-red-900/30 border border-red-700/40 text-red-200'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        <p className="text-[11px] lg:text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      
                      {/* Avatar for user */}
                      {isUser && (
                        <div className="flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6 rounded bg-indigo-600 flex items-center justify-center text-[10px] lg:text-xs mt-0.5">
                          👤
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-start gap-1.5 lg:gap-2">
                    <div className="flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] lg:text-xs">
                      🤖
                    </div>
                    <div className="px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg bg-slate-800">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-1.5 lg:p-2 border-t border-slate-700/30 bg-slate-800/50 flex-shrink-0">
                <div className="flex gap-1 lg:gap-1.5 items-end">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-2 lg:px-2.5 py-1.5 border border-slate-600/50 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-xs bg-slate-700/50 text-slate-100 placeholder-slate-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-2.5 lg:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed text-xs shadow-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Empty State
            <>
              {/* Empty State Header */}
              <div className="px-2 lg:px-2.5 py-1.5 lg:py-2 border-b border-slate-700/30 bg-slate-800/50 flex-shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Show conversations button on mobile */}
                  <button
                    onClick={() => setShowConversationList(true)}
                    className="lg:hidden text-slate-300 hover:text-white transition-colors"
                    title="Show conversations"
                  >
                    <span className="text-lg">☰</span>
                  </button>
                  <h2 className="text-xs lg:text-sm font-semibold text-slate-300 flex items-center gap-1 lg:gap-1.5 uppercase tracking-wider">
                    <span className="text-sm lg:text-base">🤖</span>
                    <span>Assistant</span>
                  </h2>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 text-center bg-slate-900/50">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-800 rounded-lg lg:rounded-xl flex items-center justify-center mb-2 lg:mb-3 shadow-lg">
                  <span className="text-xl lg:text-2xl">🤖</span>
                </div>
                <h3 className="text-sm lg:text-base font-semibold text-slate-200 mb-1">
                  AI Assistant
                </h3>
                <p className="text-slate-400 text-[11px] lg:text-xs mb-3 lg:mb-4 max-w-xs leading-relaxed">
                  Start a new conversation or select an existing one
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-all font-medium flex items-center gap-1.5 text-xs shadow-sm"
                >
                  <span>💬</span>
                  <span>New Chat</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

