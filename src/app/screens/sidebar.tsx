"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
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
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 h-screen p-6 shadow-2xl">
      {/* Logo / Brand */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📦</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">DataVault</h1>
            <p className="text-xs text-slate-400">Secure Document Hub</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          {user.isAdmin && (
            <div className="mt-2 px-2 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-md">
              <span className="text-xs font-semibold text-amber-400">👑 Admin</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-col space-y-2">
        {menu
          .filter((item) => !item.adminOnly || user?.isAdmin)
          .map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105` 
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white hover:translate-x-1"
                  }
                `}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
