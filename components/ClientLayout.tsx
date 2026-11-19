"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AuthProvider } from "@/lib/auth";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col justify-between">
        {!isAdmin && <Navbar />}
        <main className="flex-1">{children}</main>
        {!isAdmin && <Footer />}
      </div>
    </AuthProvider>
  );
}

