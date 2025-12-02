/**
 * Test Error Boundary Page
 *
 * This page tests the ErrorBoundary component.
 * Delete this file after verifying error boundaries work.
 *
 * URL: http://localhost:3000/test-error-boundary
 */

"use client";

import { useState } from "react";

export default function TestErrorBoundaryPage() {
	const [shouldError, setShouldError] = useState(false);

	if (shouldError) {
		// This will trigger the ErrorBoundary
		throw new Error("🧪 Test error - ErrorBoundary should catch this!");
	}

	return (
		<div className="container mx-auto p-8 max-w-2xl">
			<h1 className="text-3xl font-bold mb-4">🛡️ Error Boundary Test</h1>

			<div className="bg-blue-100 border border-blue-400 rounded p-4 mb-6">
				<p className="text-sm text-blue-800">
					ℹ️ <strong>Info:</strong> This page tests React Error Boundaries.
					<br />
					Click the button below to trigger an error that will be caught by the ErrorBoundary.
				</p>
			</div>

			<div className="space-y-4">
				<div className="border rounded p-4">
					<h2 className="font-bold mb-2">Test: Trigger Component Error</h2>
					<p className="text-sm text-gray-600 mb-3">
						This will throw an error during render. The ErrorBoundary should catch it and show a fallback UI.
					</p>
					<button
						onClick={() => setShouldError(true)}
						className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
					>
						Trigger Error
					</button>
				</div>
			</div>

			<div className="mt-8 p-4 bg-gray-100 rounded">
				<h3 className="font-bold mb-2">Expected Behavior:</h3>
				<ol className="list-decimal list-inside space-y-1 text-sm">
					<li>Click "Trigger Error" button</li>
					<li>Component throws an error</li>
					<li>ErrorBoundary catches the error</li>
					<li>Fallback UI is displayed with error details (dev mode)</li>
					<li>Error is automatically sent to Sentry</li>
					<li>User can click "Intentar de nuevo" to recover</li>
				</ol>
			</div>

			<div className="mt-4 text-sm text-gray-600">
				<p>🗑️ <strong>Delete this file after testing:</strong> <code>apps/web/app/test-error-boundary/page.tsx</code></p>
			</div>
		</div>
	);
}
