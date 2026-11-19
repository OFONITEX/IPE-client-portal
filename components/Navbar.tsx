"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Search,
  FileText,
  Lock,
  Menu,
  X,
  PhoneCall,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top emergency / official bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-400">instantipesubmit.com.ng</span>
            <span className="text-slate-600">•</span>
            <span className="font-medium text-slate-200">Official National Identity Clearance Portal</span>
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
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-slate-900 tracking-tight flex items-center">
                InstantIPE<span className="text-emerald-600">Submit</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                .com.ng
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              instantipesubmit.com.ng • Fast-Track Identity Clearance
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition ${
              pathname === "/" || pathname.startsWith("/submit") ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"
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
            href="/#faq"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            FAQs
          </Link>
        </div>

        {/* User Auth & CTA buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.firstName[0]?.toUpperCase() || "U"}
                </div>
                <div className="text-left text-xs leading-tight">
                  <span className="font-bold block text-slate-900">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </Link>
            </div>
          )}

          <div className="h-5 w-px bg-slate-200 mx-1"></div>

          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Submission
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
          {user ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                  {user.firstName[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1 pb-2 border-b border-slate-100">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 px-3 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 px-3 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Sign Up
              </Link>
            </div>
          )}

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
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
              href="/"
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
