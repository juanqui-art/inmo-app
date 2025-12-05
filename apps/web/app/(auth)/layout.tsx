/**
 * AUTH LAYOUT
 *
 * Shared layout for login and signup pages.
 * Features:
 * - Split-screen design (image left, form right)
 * - Responsive: full-width form on mobile
 * - Dark mode support
 * - Premium hero image with gradient overlay
 */

import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero_section.jpg')",
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60 z-10" />

        {/* Logo */}
        <Link
          href="/"
          className="absolute top-8 left-8 z-20 text-white font-bold text-2xl hover:opacity-80 transition-opacity"
        >
          InmoApp
        </Link>

        {/* Hero text */}
        <div className="absolute bottom-12 left-12 right-12 text-oslo-gray-50 z-20">
          <h2 className="font-serif text-4xl font-bold mb-3 text-balance">
            Encuentra tu hogar ideal
          </h2>
          <p className="text-lg text-oslo-gray-200 text-pretty max-w-md">
            Las mejores propiedades en las ubicaciones más exclusivas de Ecuador
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile logo (visible only on mobile) */}
        <div className="lg:hidden p-6 border-b border-border">
          <Link
            href="/"
            className="text-foreground font-bold text-xl hover:opacity-80 transition-opacity"
          >
            InmoApp
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
