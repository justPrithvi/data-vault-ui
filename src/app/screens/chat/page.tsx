"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/context/PageHeaderContext";
import api from "@/app/lib/axios";

interface Conversation {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: string;
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
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 1, title: "Document Analysis Q&A", lastMessage: "How do I analyze...", timestamp: "2 hours ago" },
    { id: 2, title: "Data Extraction Help", lastMessage: "Can you extract...", timestamp: "Yesterday" },
    { id: 3, title: "Report Generation", lastMessage: "Generate a summary...", timestamp: "2 days ago" },
  ]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Load conversation messages when selected
  useEffect(() => {
    if (selectedConversation) {
      // Mock messages - replace with API call later
      setMessages([
        {
          id: 1,
          role: 'assistant',
          content: 'Hello! How can I help you with your documents today?',
          timestamp: new Date().toISOString(),
        }
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    // Update conversation title if this is the first user message
    if (messages.length <= 1 && selectedConversation) {
      const conversationTitle = currentInput.length > 30 
        ? currentInput.substring(0, 30) + '...' 
        : currentInput;
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation 
            ? { ...conv, title: conversationTitle, lastMessage: currentInput }
            : conv
        )
      );
    }

    try {
      // Call Python AI service endpoint
      // TODO: Replace with actual endpoint when available
      const response = await api.post('/ai/chat', {
        message: currentInput,
        conversationId: selectedConversation,
        userId: user?.id,
      });

      const assistantMessage: Message = {
        id: messages.length + 2,
        role: 'assistant',
        content: response.data.message || response.data.response || 'Response received successfully.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
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
        id: messages.length + 2,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    // Create a new temporary conversation ID
    const newConvId = Date.now();
    setSelectedConversation(newConvId);
    
    // Start with a welcome message
    const welcomeMessage: Message = {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you with your documents today?',
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
    
    // Add to conversations list
    const newConversation: Conversation = {
      id: newConvId,
      title: 'New Conversation',
      lastMessage: 'Start chatting...',
      timestamp: 'Just now',
    };
    setConversations([newConversation, ...conversations]);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-full overflow-hidden flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
        {/* Left Panel: Conversations List */}
        <div className="lg:col-span-1 bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex flex-col overflow-hidden">
          {/* Header with New Chat Button */}
          <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-700">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>💬</span>
              <span>Conversations</span>
            </h2>
            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
            >
              <span>+</span>
              <span>New</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-3 bg-slate-900">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-slate-400 text-sm">No conversations yet</p>
                <p className="text-slate-500 text-xs mt-1">Start a new chat!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedConversation === conv.id
                        ? 'bg-gradient-to-r from-indigo-900 to-purple-900 border-2 border-indigo-500 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 border-2 border-transparent'
                    }`}
                  >
                    <h3 className="font-semibold text-slate-100 text-sm truncate mb-1">
                      {conv.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-slate-500 mt-1">{conv.timestamp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="lg:col-span-3 bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex flex-col overflow-hidden">
          {selectedConversation || messages.length > 0 ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3 border-b border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-700">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🤖</span>
                  <span>AI Assistant</span>
                </h2>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-900">
                {messages.map((msg) => {
                  const isError = msg.role === 'assistant' && msg.content.startsWith('⚠️');
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white'
                            : isError
                            ? 'bg-red-900/50 border-2 border-red-700 text-red-200 shadow-sm'
                            : 'bg-slate-800 border-2 border-slate-700 text-slate-200 shadow-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.role === 'user' ? 'text-white/70' : isError ? 'text-red-400' : 'text-slate-500'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-slate-800 border-2 border-slate-700">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Ask me anything about your documents..."
                    className="flex-1 px-4 py-3 border-2 border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm bg-slate-700 text-slate-100 placeholder-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Send</span>
                    <span>📤</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Tip: Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">
                AI Chat Assistant
              </h3>
              <p className="text-slate-400 mb-6 max-w-md">
                Start a new conversation or select an existing one to chat with our AI assistant about your documents.
              </p>
              <button
                onClick={handleNewChat}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:shadow-xl transition-all font-semibold flex items-center gap-3"
              >
                <span>💬</span>
                <span>Start New Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

