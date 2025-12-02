/**
 * Sentry Client Configuration
 *
 * This file configures Sentry for the browser/client side.
 *
 * Environment variables needed:
 * - NEXT_PUBLIC_SENTRY_DSN: Your Sentry project DSN (public, safe for client)
 * - NEXT_PUBLIC_SENTRY_ENVIRONMENT: Environment name (development, staging, production)
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV;

Sentry.init({
	// Required: Your Sentry DSN
	dsn: SENTRY_DSN,

	// Environment
	environment: SENTRY_ENVIRONMENT,

	// Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
	// We recommend adjusting this value in production
	tracesSampleRate: SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0,

	// Capture Replay for 10% of all sessions,
	// plus 100% of sessions with an error
	replaysSessionSampleRate: SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0,
	replaysOnErrorSampleRate: 1.0,

	// You can remove this option if you're not planning to use the Sentry Session Replay feature:
	integrations: [
		Sentry.replayIntegration({
			// Additional Replay configuration goes in here, for example:
			maskAllText: true,
			blockAllMedia: true,
		}),
		Sentry.browserTracingIntegration(),
	],

	// Ignore common errors
	ignoreErrors: [
		// Browser extensions
		"top.GLOBALS",
		// Random plugins/extensions
		"originalCreateNotification",
		"canvas.contentDocument",
		"MyApp_RemoveAllHighlights",
		// Facebook
		"fb_xd_fragment",
		// ISP injected errors
		"bmi_SafeAddOnload",
		"EBCallBackMessageReceived",
		// Chrome extensions
		"chrome-extension://",
		"moz-extension://",
		// Network errors that aren't actionable
		"NetworkError",
		"Network request failed",
	],

	// Only send errors in production or when explicitly enabled
	enabled: SENTRY_ENVIRONMENT === "production" || process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true",

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
			process.env.NEXT_PUBLIC_SENTRY_ENABLED !== "true"
		) {
			console.log("[Sentry] Event captured (not sent in dev):", event);
			return null;
		}

		return event;
	},
});
