// src/app/dashboard/layout.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import { useEffect, useState } from "react";
import { PageHeaderProvider, usePageHeader } from "@/context/PageHeaderContext";
import PageHeader from "@/components/PageHeader";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { headerConfig, searchQuery, setSearchQuery } = usePageHeader();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (headerConfig?.onSearchChange) {
      headerConfig.onSearchChange(value);
    }
  };

  return (
    <>
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {headerConfig && (
          <div className="px-2 lg:px-4 pt-2 lg:pt-4 pb-2 lg:pb-3 flex-shrink-0">
            <PageHeader 
              {...headerConfig} 
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onMenuClick={() => setIsMobileSidebarOpen(true)}
            />
          </div>
        )}
        <div className="flex-1 overflow-hidden min-h-0 px-2 lg:px-4 pb-2 lg:pb-4">
          {children}
        </div>
      </main>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, authContextLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {    
    console.log(authContextLoading, user);
    
    if (!authContextLoading && !user) {
      router.push("/auth/login"); // redirect if not logged in
    }
  }, [user, router, authContextLoading]);

  return (
    <PageHeaderProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        <LayoutContent>{children}</LayoutContent>
      </div>
    </PageHeaderProvider>
  );
}
