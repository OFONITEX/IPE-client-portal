/**
 * Cloudflare Pages Middleware for Subdomain Host Routing
 * Routes admin.instantipesubmit.com.ng to /admin/ routes natively at the edge.
 */

export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  const host = (context.request.headers.get("host") || "").toLowerCase();

  const isAdminSubdomain = host.startsWith("admin.");

  if (isAdminSubdomain) {
    // Allow edge API routes and Next.js static bundles to pass untouched
    if (
      url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/_next/") ||
      url.pathname.includes(".")
    ) {
      return context.next();
    }

    // If pathname doesn't already start with /admin, prefix it
    if (!url.pathname.startsWith("/admin")) {
      const cleanPath = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
      url.pathname = `/admin${cleanPath}/`;
      return context.env.ASSETS.fetch(new Request(url.toString(), context.request));
    }
  }

  return context.next();
}
