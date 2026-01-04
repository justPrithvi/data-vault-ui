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
            <div className="h-full bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden m-6">

                {/* Content Grid */}
                <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
                  
                  {/* User Profile Card */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-lg border-2 border-indigo-700 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                          Profile Information
                          {user?.isAdmin && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-semibold rounded-md">
                              👑 ADMIN
                            </span>
                          )}
                        </h2>
                        <p className="text-slate-400 text-xs">Your personal details</p>
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between items-center py-3 px-4 bg-slate-700 rounded-lg border border-slate-600 shadow-sm">
                        <span className="text-slate-300 font-semibold flex items-center gap-2 text-sm">
                          <span>👤</span>
                          <span>Name</span>
                        </span>
                        <span className="text-slate-100 font-bold text-sm">{user?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-slate-700 rounded-lg border border-slate-600 shadow-sm">
                        <span className="text-slate-300 font-semibold flex items-center gap-2 text-sm">
                          <span>📧</span>
                          <span>Email</span>
                        </span>
                        <span className="text-slate-100 font-bold text-sm truncate ml-2">{user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-slate-700 rounded-lg border border-slate-600 shadow-sm">
                        <span className="text-slate-300 font-semibold flex items-center gap-2 text-sm">
                          <span>🔑</span>
                          <span>User ID</span>
                        </span>
                        <span className="text-slate-100 font-bold text-sm">#{user?.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-slate-700 rounded-lg border border-slate-600 shadow-sm">
                        <span className="text-slate-300 font-semibold flex items-center gap-2 text-sm">
                          <span>👔</span>
                          <span>Role</span>
                        </span>
                        <span className={`font-bold px-3 py-1 rounded-lg text-xs ${
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
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-lg border-2 border-indigo-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">🚪</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-100">Account Actions</h2>
                          <p className="text-slate-400 text-xs">Manage your session</p>
                        </div>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-4 border border-indigo-700">
                        <p className="text-sm text-slate-300 mb-2">
                          <span className="font-semibold">⚠️ Warning:</span> Logging out will end your current session.
                        </p>
                        <p className="text-xs text-slate-400">
                          You'll need to sign in again to access your documents.
                        </p>
                      </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 font-bold hover:scale-105 flex items-center justify-center gap-3 mt-4"
                    >
                        <span className="text-xl">🚪</span>
                        <span>Logout</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  </div>

                </div>
            </div>
        </div>
    );
}
