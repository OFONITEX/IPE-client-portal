"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {!isAdmin && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
    </div>
  );
}

