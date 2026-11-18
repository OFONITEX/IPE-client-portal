import React from "react";
import Link from "next/link";
import { Shield, Lock, CheckCircle, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">InstantIPE<span className="text-emerald-400">Submit</span></span>
                <span className="block text-[11px] font-mono text-emerald-400">instantipesubmit.com.ng</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified digital clearinghouse for IPE, Mod IPE, Validation, Mod Validation, and NIN Modification submissions.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              <span>TLS 1.3 End-to-End Encrypted</span>
            </div>
          </div>

          {/* Direct Services (5 Services) */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Direct Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/submit?service=IPE" className="hover:text-emerald-400 transition">
                  IPE Clearance (15 Chars)
                </Link>
              </li>
              <li>
                <Link href="/submit?service=MOD_IPE" className="hover:text-emerald-400 transition">
                  Mod IPE (15 Chars)
                </Link>
              </li>
              <li>
                <Link href="/submit?service=VALIDATION" className="hover:text-emerald-400 transition">
                  NIN Validation (11 Digits)
                </Link>
              </li>
              <li>
                <Link href="/submit?service=MOD_VALIDATION" className="hover:text-emerald-400 transition">
                  Mod Validation (11 Digits)
                </Link>
              </li>
              <li>
                <Link href="/submit?service=MODIFICATION" className="hover:text-emerald-400 transition">
                  NIN Modification (11 Digits)
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Compliance</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>NIMC Standards Compliant</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>NDPR Data Privacy Compliant</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Automated Payment Reconciliation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>24/7 Digital Tracking Lookup</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Helpdesk & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+234 (0) 800 433 6848</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@instantipesubmit.com.ng</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Federal Secretariat Complex, CBD, Abuja, Nigeria</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <Link
                href="/admin"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Authorized Admin Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} instantipesubmit.com.ng. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Security Disclosures</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
