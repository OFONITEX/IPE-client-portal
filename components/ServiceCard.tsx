import React from "react";
import Link from "next/link";
import { ServiceConfig } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ShieldAlert, FileEdit, CheckCircle2, RefreshCw, Sliders, ArrowRight } from "lucide-react";

interface Props {
  service: ServiceConfig;
}

export function ServiceCard({ service }: Props) {
  const getIcon = (id: string) => {
    switch (id) {
      case "IPE":
        return <ShieldAlert className="w-4 h-4 text-emerald-600" />;
      case "MOD_IPE":
        return <FileEdit className="w-4 h-4 text-blue-600" />;
      case "VALIDATION":
        return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
      case "MOD_VALIDATION":
        return <RefreshCw className="w-4 h-4 text-purple-600" />;
      case "MODIFICATION":
        return <Sliders className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition duration-200 flex flex-col justify-between p-4 group">
      <div className="space-y-3">
        {/* Top bar: Icon + Badge */}
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 transition">
            {getIcon(service.id)}
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition">
            {service.badgeText}
          </span>
        </div>

        {/* Title & Short Description */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
            {service.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
            {service.shortDescription}
          </p>
        </div>

        {/* Compact Requirement Pill */}
        <div className="text-[11px] bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-slate-600">
          <span className="text-slate-400 font-medium">Input:</span>
          <span className="font-mono font-bold text-slate-800">
            {service.expectedLength} {service.formatType === "NUMERIC_11" ? "Digits (NIN)" : "Alphanumeric"}
          </span>
        </div>
      </div>

      {/* Bottom Bar: Price + Apply Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
            Fee
          </span>
          <span className="text-base sm:text-lg font-extrabold text-slate-900">
            {formatCurrency(service.price)}
          </span>
        </div>

        <Link
          href={`/submit?service=${service.id}`}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center gap-1"
        >
          <span>Apply</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
