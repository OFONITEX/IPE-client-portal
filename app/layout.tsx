import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Identity Services Portal | IPE, Personalization & NIN Validation",
  description:
    "Official submissions portal for IPE (Internal Processing Exception), ID Card Personalization, and 11-digit NIN Validation with integrated instant payment and status tracking.",
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

