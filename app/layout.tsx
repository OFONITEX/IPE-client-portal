import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "InstantIPESubmit | Official IPE, Mod IPE & NIN Validation Portal",
  description:
    "Official fast-track portal on instantipesubmit.com.ng for 15-character IPE / Mod IPE Exception Clearance, 11-digit NIN Validation, Mod Validation, and NIN Data Modification.",
  metadataBase: new URL("https://instantipesubmit.com.ng"),
  alternates: {
    canonical: "https://instantipesubmit.com.ng",
  },
  openGraph: {
    title: "InstantIPESubmit | Official IPE & NIN Clearance Portal",
    description:
      "Submit and track IPE clearance, Mod IPE, NIN Validation, Mod Validation, and NIN Modifications on instantipesubmit.com.ng.",
    url: "https://instantipesubmit.com.ng",
    siteName: "InstantIPESubmit",
    locale: "en_NG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Paystack Inline Script for direct checkout modal */}
        <script src="https://js.paystack.co/v1/inline.js" async></script>
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

