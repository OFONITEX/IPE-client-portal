"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Search, FileText, Lock, Menu, X, PhoneCall } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top emergency / official bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">Official Identity Clearance & Validation Portal</span>
            <span className="hidden sm:inline text-slate-400">• Standardized 256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>Helpdesk: +234 (0) 800 433 6848</span>
            </span>
            <Link
              href="/admin"
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition"
            >
              <Lock className="w-3 h-3" />
              Admin Access
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">IdentityHub</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              IPE • Mod IPE • Validation • Mod Validation • Modification
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition ${
              pathname === "/" ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Home
          </Link>
          <Link
            href="/submit"
            className={`text-sm font-medium transition ${
              pathname.startsWith("/submit") ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Submit Application
          </Link>
          <Link
            href="/track"
            className={`text-sm font-medium flex items-center gap-1.5 transition ${
              pathname.startsWith("/track") ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-4 h-4 text-emerald-600" />
            Track Status
          </Link>
          <Link
            href="/#services"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Available Services
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            FAQs
          </Link>
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/track"
            className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Track Reference
          </Link>
          <Link
            href="/submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            New Submission
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            href="/submit"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Submit Application
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Track Status
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-amber-700 bg-amber-50"
          >
            Admin Portal
          </Link>
          <div className="pt-2">
            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center block px-4 py-2.5 rounded-lg text-white bg-emerald-600 font-semibold"
            >
              Start Submission
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
