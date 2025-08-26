"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname().split('/')[2];  

  const menu = [
    { name: "Dashboard", icon: "📊", href: "dashboard" },
    { name: "Documents", icon: "📄", href: "document" },
    { name: "Tags", icon: "🏷️", href: "tags" },
    { name: "Settings", icon: "⚙️", href: "settings" },
  ];

  return (
    <aside className="w-60 bg-gray-100 h-screen p-6">
      <h1 className="text-2xl font-bold mb-5 ml-3">Insight Vault</h1>
      <nav className="flex flex-col space-y-4">
        {menu.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 text-xl rounded 
                ${isActive ? "bg-blue-500 text-white font-semibold" : "hover:bg-gray-200"}
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
