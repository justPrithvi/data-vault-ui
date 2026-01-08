"use client";

import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/context/PageHeaderContext";
import { useEffect } from "react";

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { setHeaderConfig } = usePageHeader();

    // Set header config for settings page
    useEffect(() => {
        setHeaderConfig({
            icon: "⚙️",
            title: "Settings",
            subtitle: "Manage your account and preferences",
            searchPlaceholder: "Search settings...",
            onSearchChange: () => {},
        });
    }, [setHeaderConfig]);

    const handleLogout = () => {
        logout()
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-full overflow-hidden flex flex-col">
            <div className="h-full bg-slate-800/80 backdrop-blur-sm rounded-lg lg:rounded-xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">

                {/* Content Grid */}
                <div className="flex-1 p-2 lg:p-4 grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 overflow-auto">
                  
                  {/* User Profile Card */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg lg:rounded-xl p-3 lg:p-4 shadow-lg border border-indigo-700 flex flex-col">
                    <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base lg:text-lg shadow-lg flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm lg:text-base font-bold text-slate-100 flex items-center gap-1.5 lg:gap-2 flex-wrap">
                          <span className="truncate">Profile Information</span>
                          {user?.isAdmin && (
                            <span className="px-1.5 lg:px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] lg:text-xs font-semibold rounded flex-shrink-0">
                              👑 ADMIN
                            </span>
                          )}
                        </h2>
                        <p className="text-slate-400 text-[10px] lg:text-xs">Your personal details</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 lg:space-y-2 flex-1">
                      <div className="flex justify-between items-center py-2 lg:py-2.5 px-2.5 lg:px-3 bg-slate-700 rounded-lg border border-slate-600 shadow-sm">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs lg:text-sm">
                          <span>👤</span>
                          <span>Name</span>
                        </span>
                        <span className="text-slate-100 font-bold text-xs lg:text-sm truncate max-w-[50%]">{user?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 lg:py-2.5 px-2.5 lg:px-3 bg-slate-700 rounded-lg border border-slate-600 shadow-sm">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs lg:text-sm">
                          <span>📧</span>
                          <span>Email</span>
                        </span>
                        <span className="text-slate-100 font-bold text-xs lg:text-sm truncate max-w-[50%]">{user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 lg:py-2.5 px-2.5 lg:px-3 bg-slate-700 rounded-lg border border-slate-600 shadow-sm">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs lg:text-sm">
                          <span>🔑</span>
                          <span>User ID</span>
                        </span>
                        <span className="text-slate-100 font-bold text-xs lg:text-sm">#{user?.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 lg:py-2.5 px-2.5 lg:px-3 bg-slate-700 rounded-lg border border-slate-600 shadow-sm">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs lg:text-sm">
                          <span>👔</span>
                          <span>Role</span>
                        </span>
                        <span className={`font-bold px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-lg text-[10px] lg:text-xs ${
                          user?.isAdmin 
                            ? 'bg-amber-900 text-amber-300' 
                            : 'bg-indigo-900 text-indigo-300'
                        }`}>
                          {user?.isAdmin ? 'Administrator' : 'User'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg lg:rounded-xl p-3 lg:p-4 shadow-lg border border-indigo-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                        <div className="w-9 h-9 lg:w-11 lg:h-11 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <span className="text-base lg:text-lg">🚪</span>
                        </div>
                        <div>
                          <h2 className="text-sm lg:text-base font-bold text-slate-100">Account Actions</h2>
                          <p className="text-slate-400 text-[10px] lg:text-xs">Manage your session</p>
                        </div>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-2.5 lg:p-3 border border-indigo-700">
                        <p className="text-xs lg:text-sm text-slate-300 mb-1.5 lg:mb-2">
                          <span className="font-semibold">⚠️ Warning:</span> Logging out will end your current session.
                        </p>
                        <p className="text-[10px] lg:text-xs text-slate-400">
                          You'll need to sign in again to access your documents.
                        </p>
                      </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 font-bold flex items-center justify-center gap-2 lg:gap-3 mt-3 lg:mt-4 text-xs lg:text-sm"
                    >
                        <span className="text-base lg:text-lg">🚪</span>
                        <span>Logout</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  </div>

                </div>
            </div>
        </div>
    );
}
