import React from "react";
import Link from "next/link";
import { ServiceConfig } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ShieldAlert, FileEdit, CheckCircle2, RefreshCw, Sliders, ArrowRight, Check } from "lucide-react";

interface Props {
  service: ServiceConfig;
}

export function ServiceCard({ service }: Props) {
  const getIcon = (id: string) => {
    switch (id) {
      case "IPE":
        return <ShieldAlert className="w-6 h-6 text-emerald-600" />;
      case "MOD_IPE":
        return <FileEdit className="w-6 h-6 text-blue-600" />;
      case "VALIDATION":
        return <CheckCircle2 className="w-6 h-6 text-teal-600" />;
      case "MOD_VALIDATION":
        return <RefreshCw className="w-6 h-6 text-purple-600" />;
      case "MODIFICATION":
        return <Sliders className="w-6 h-6 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition duration-300 flex flex-col justify-between overflow-hidden group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition duration-300">
            {getIcon(service.id)}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {service.badgeText}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
          {service.name}
        </h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {service.fullDescription}
        </p>

        {/* Requirements Pill */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Requirement:</span>
            <span className="font-mono font-bold text-slate-800">
              {service.expectedLength} {service.formatType === "NUMERIC_11" ? "Digits (NIN)" : "Alphanumeric"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Queue:</span>
            <span className="font-semibold text-emerald-600">Admin Approved</span>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Digital verification slip issued</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Admin review upon payment confirmation</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Live status tracking via reference ID</span>
          </li>
        </ul>
      </div>

      <div className="p-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Service Fee</span>
          <span className="text-xl font-extrabold text-slate-900">
            {formatCurrency(service.price)}
          </span>
        </div>

        <Link
          href={`/submit?service=${service.id}`}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center gap-1.5"
        >
          <span>Apply</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
