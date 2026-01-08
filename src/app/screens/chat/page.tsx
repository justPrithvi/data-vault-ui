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
      try {
        setIsLoadingConversations(true);
        const response = await getConversations();
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
  }, []);

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
        user?.id?.toString()
      );

      console.log('Full response from backend:', response);

      // If this was a new conversation, update the selectedConversation with the returned ID
      if (!selectedConversation && response.conversationId) {
        setSelectedConversation(response.conversationId);
        
        // Refresh the conversations list to include the new conversation
        const updatedConversations = await getConversations();
        setConversations(updatedConversations.conversations || []);
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-2 overflow-hidden">
        {/* Left Panel: Conversations List */}
        <div className="lg:col-span-1 bg-slate-800/80 rounded-lg border border-slate-700/50 flex flex-col overflow-hidden backdrop-blur-sm">
          {/* Header with New Chat Button */}
          <div className="px-2.5 py-2 border-b border-slate-700/30 flex justify-between items-center bg-slate-800/50">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="text-base">💬</span>
              <span>Chats</span>
            </h2>
            <button
              onClick={handleNewChat}
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-all shadow-sm"
              title="Start new conversation"
            >
              + New
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-1.5 bg-slate-900/50">
            {isLoadingConversations ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-3">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-xl">💬</span>
                </div>
                <p className="text-slate-400 text-xs">No conversations</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conv) => {
                  const isActive = selectedConversation === conv.conversationId;
                  return (
                    <div
                      key={conv.conversationId}
                      onClick={() => setSelectedConversation(conv.conversationId)}
                      className={`group relative px-2.5 py-2 rounded-md cursor-pointer transition-all ${
                        isActive
                          ? 'bg-indigo-600/20 shadow-sm'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-indigo-500 rounded-r"></div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs mt-0.5 ${
                          isActive 
                            ? 'bg-indigo-600/30 text-indigo-300' 
                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                        }`}>
                          💬
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-xs truncate mb-0.5 ${
                            isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {conv.title}
                          </h3>
                          <p className="text-[10px] text-slate-500 truncate leading-tight line-clamp-1">
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
        <div className="lg:col-span-3 bg-slate-800/80 rounded-lg border border-slate-700/50 flex flex-col overflow-hidden backdrop-blur-sm">
          {messages.length > 0 ? (
            <>
              {/* Chat Header */}
              <div className="px-2.5 py-2 border-b border-slate-700/30 bg-slate-800/50 flex-shrink-0 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="text-base">🤖</span>
                  <span>Assistant</span>
                </h2>
                {selectedConversation && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    {conversations.find(c => c.conversationId === selectedConversation)?.messageCount || 0} messages
                  </span>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2 bg-slate-900/50">
                {messages.map((msg) => {
                  const isError = msg.role === 'assistant' && msg.content.startsWith('⚠️');
                  const isUser = msg.role === 'user';
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar for assistant */}
                      {!isUser && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs mt-0.5">
                          🤖
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      <div
                        className={`max-w-[75%] px-2.5 py-1.5 rounded-lg ${
                          isUser
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : isError
                            ? 'bg-red-900/30 border border-red-700/40 text-red-200'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      
                      {/* Avatar for user */}
                      {isUser && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-xs mt-0.5">
                          👤
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-xs">
                      🤖
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-slate-800">
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
              <div className="p-2 border-t border-slate-700/30 bg-slate-800/50 flex-shrink-0">
                <div className="flex gap-1.5 items-end">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-2.5 py-1.5 border border-slate-600/50 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-xs bg-slate-700/50 text-slate-100 placeholder-slate-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed text-xs shadow-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-900/50">
              <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-1">
                AI Assistant
              </h3>
              <p className="text-slate-400 text-xs mb-4 max-w-xs leading-relaxed">
                Start a new conversation or select an existing one from the sidebar
              </p>
              <button
                onClick={handleNewChat}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-all font-medium flex items-center gap-1.5 text-xs shadow-sm"
              >
                <span>💬</span>
                <span>New Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

