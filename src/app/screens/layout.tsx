// src/app/dashboard/layout.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import { useEffect } from "react";
import { PageHeaderProvider, usePageHeader } from "@/context/PageHeaderContext";
import PageHeader from "@/components/PageHeader";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { headerConfig, searchQuery, setSearchQuery } = usePageHeader();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (headerConfig?.onSearchChange) {
      headerConfig.onSearchChange(value);
    }
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {headerConfig && (
        <div className="px-5 pt-5 pb-4 flex-shrink-0">
          <PageHeader 
            {...headerConfig} 
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        </div>
      )}
      <div className="flex-1 overflow-hidden min-h-0 px-5 pb-5">
        {children}
      </div>
    </main>
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
        <Sidebar />
        <LayoutContent>{children}</LayoutContent>
      </div>
    </PageHeaderProvider>
  );
}
