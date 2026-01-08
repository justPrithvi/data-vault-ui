"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname().split('/')[2];
  const { user } = useAuth();

  const menu = [
    { name: "Dashboard", icon: "📊", href: "dashboard", color: "from-indigo-600 to-purple-600" },
    { name: "Documents", icon: "📄", href: "document", color: "from-indigo-600 to-purple-600" },
    { name: "Chat", icon: "💬", href: "chat", color: "from-indigo-600 to-purple-600" },
    { name: "Tags", icon: "🏷️", href: "tags", adminOnly: true, color: "from-indigo-600 to-purple-600" },
    { name: "Settings", icon: "⚙️", href: "settings", color: "from-indigo-600 to-purple-600" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-56 lg:w-60
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
        h-screen p-3 lg:p-4 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo / Brand */}
        <div className="mb-4 lg:mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-lg lg:text-xl">📦</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base lg:text-lg font-bold text-white tracking-tight truncate">DataVault</h1>
              <p className="text-[10px] lg:text-xs text-slate-400 truncate">Secure Document Hub</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="mb-3 lg:mb-4 p-2 lg:p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
                <p className="text-[10px] lg:text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            {user.isAdmin && (
              <div className="mt-1.5 px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded">
                <span className="text-[10px] lg:text-xs font-semibold text-amber-400">👑 Admin</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col space-y-1">
          {menu
            .filter((item) => !item.adminOnly || user?.isAdmin)
            .map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onMobileClose}
                  className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    }
                  `}
                >
                  <span className="text-base lg:text-lg flex-shrink-0">{item.icon}</span>
                  <span className="font-medium text-xs lg:text-sm truncate">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1 h-1 bg-white rounded-full animate-pulse flex-shrink-0"></div>
                  )}
                </Link>
              );
            })}
        </nav>
      </aside>
    </>
  );
}
