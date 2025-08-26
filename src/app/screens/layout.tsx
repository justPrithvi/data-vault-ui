// src/app/dashboard/layout.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import { useEffect } from "react";

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
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />           {/* always visible */}
      <main style={{ flex: 1 }}>{children}</main> {/* dynamic main window */}
    </div>
  );
}
