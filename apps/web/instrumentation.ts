/**
 * Next.js Instrumentation File
 *
 * This file runs ONCE when the server starts (before any requests are handled).
 * Perfect for initializing monitoring tools like Sentry.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * IMPORTANT: This file must be at the root of `apps/web/` (same level as `app/`)
 */

export async function register() {
	// Only register Sentry in Node.js runtime (not Edge)
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./sentry.server.config");
	}

	// For Edge runtime (middleware, edge functions)
	if (process.env.NEXT_RUNTIME === "edge") {
		await import("./sentry.edge.config");
	}
}
