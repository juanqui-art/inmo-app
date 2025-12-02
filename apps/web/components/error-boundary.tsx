/**
 * React Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI.
 * Integrates with Sentry for automatic error reporting.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * Features:
 * - Automatic Sentry error reporting
 * - Customizable fallback UI
 * - Reset functionality to recover from errors
 * - Development vs production error details
 */

"use client";

import * as Sentry from "@sentry/nextjs";
import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		// Update state so the next render will show the fallback UI
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// Log error details
		console.error("ErrorBoundary caught an error:", error, errorInfo);

		// Update state with error info
		this.setState({
			errorInfo,
		});

		// Send to Sentry
		Sentry.captureException(error, {
			contexts: {
				react: {
					componentStack: errorInfo.componentStack,
				},
			},
		});

		// Call custom error handler if provided
		this.props.onError?.(error, errorInfo);
	}

	resetError = (): void => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	render(): ReactNode {
		if (this.state.hasError) {
			// Custom fallback UI if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default fallback UI
			return <DefaultErrorFallback error={this.state.error} onReset={this.resetError} />;
		}

		return this.props.children;
	}
}

/**
 * Default Error Fallback UI
 */
interface DefaultErrorFallbackProps {
	error: Error | null;
	onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
	const isDevelopment = process.env.NODE_ENV === "development";

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					{/* Error Icon */}
					<div className="mx-auto h-12 w-12 text-red-500">
						<svg
							className="h-12 w-12"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>

					{/* Error Title */}
					<h1 className="mt-6 text-3xl font-bold text-gray-900">
						Algo salió mal
					</h1>

					{/* Error Message */}
					<p className="mt-2 text-sm text-gray-600">
						Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
					</p>

					{/* Development Error Details */}
					{isDevelopment && error && (
						<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
							<p className="text-xs font-mono text-red-800 break-all">
								<strong>Error:</strong> {error.message}
							</p>
							{error.stack && (
								<details className="mt-2">
									<summary className="text-xs font-semibold text-red-700 cursor-pointer">
										Stack Trace
									</summary>
									<pre className="mt-2 text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">
										{error.stack}
									</pre>
								</details>
							)}
						</div>
					)}

					{/* Actions */}
					<div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
						<button
							onClick={onReset}
							className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Intentar de nuevo
						</button>
						<button
							onClick={() => window.location.href = "/"}
							className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Ir al inicio
						</button>
					</div>

					{/* Help Text */}
					<p className="mt-6 text-xs text-gray-500">
						Si el problema persiste, contáctanos en{" "}
						<a href="mailto:support@inmoapp.com" className="text-blue-600 hover:text-blue-500">
							support@inmoapp.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

/**
 * Hook-based Error Boundary for functional components
 * Uses React's error boundary under the hood
 */
export function withErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	fallback?: ReactNode,
): React.ComponentType<P> {
	const WrappedComponent = (props: P) => (
		<ErrorBoundary fallback={fallback}>
			<Component {...props} />
		</ErrorBoundary>
	);

	WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`;

	return WrappedComponent;
}

export default ErrorBoundary;
