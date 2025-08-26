"use client";

import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
    const { logout } = useAuth();
    const settingsItems = [
        { id: 1, name: "Profile" },
        { id: 2, name: "Account" },
        { id: 3, name: "Notifications" },
        { id: 4, name: "Privacy" },
    ];

    const handleLogout = () => {
        logout()
    };

    return (
        <main className="flex-1 bg-gray-100 h-screen overflow-hidden">
            <div className="mt-10 mb-20 p-6 h-full bg-white rounded-xl shadow flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                </div>

                {/* Settings Items */}
                <div className="flex flex-col gap-4 mb-6">
                {settingsItems.map((item) => (
                    <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                    <span className="text-gray-800 font-medium">{item.name}</span>
                    <span className="text-gray-400">→</span>
                    </div>
                ))}
                </div>

                {/* Logout Button */}
                <div>
                <button
                    onClick={handleLogout}
                    className=" bg-red-500 text-white px-6 py-3 rounded-lg shadow hover:bg-red-600 transition font-medium"
                >
                    Logout
                </button>
                </div>

            </div>
        </main>
    );
}
