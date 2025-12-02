/**
 * Sentry Server Configuration
 *
 * This file configures Sentry for the Node.js/server side.
 *
 * Environment variables needed:
 * - SENTRY_DSN: Your Sentry project DSN (server-side)
 * - SENTRY_ENVIRONMENT: Environment name (development, staging, production)
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV;

Sentry.init({
	// Required: Your Sentry DSN
	dsn: SENTRY_DSN,

	// Environment
	environment: SENTRY_ENVIRONMENT,

	// Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
	// We recommend adjusting this value in production
	tracesSampleRate: SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0,

	// Integrations
	integrations: [
		Sentry.prismaIntegration(),
		Sentry.nativeNodeFetchIntegration(),
	],

	// Only send errors in production or when explicitly enabled
	enabled: SENTRY_ENVIRONMENT === "production" || process.env.SENTRY_ENABLED === "true",

	// Debug mode (useful for development)
	debug: SENTRY_ENVIRONMENT === "development",

	// Before send hook - can be used to filter or modify events
	beforeSend(event) {
		// Filter out events without DSN configured
		if (!SENTRY_DSN) {
			return null;
		}

		// Don't send events in development unless explicitly enabled
		if (
			SENTRY_ENVIRONMENT === "development" &&
			process.env.SENTRY_ENABLED !== "true"
		) {
			console.log("[Sentry Server] Event captured (not sent in dev):", event);
			return null;
		}

		// Add server context
		if (event.contexts) {
			event.contexts.runtime = {
				name: "node",
				version: process.version,
			};
		}

		return event;
	},
});
