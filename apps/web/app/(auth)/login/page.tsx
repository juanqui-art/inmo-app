import { Suspense } from "react";
import { LoginFormStyled } from "@/components/auth/login-form-styled";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero_section.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60 z-10" />
        <div className="absolute bottom-12 left-12 text-oslo-gray-50 z-20">
          <h2 className="font-serif text-4xl font-bold mb-3 text-balance">
            Encuentra tu hogar ideal
          </h2>
          <p className="text-lg text-oslo-gray-200 text-pretty">
            Las mejores propiedades en las ubicaciones más exclusivas
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Suspense fallback={<div>Cargando formulario...</div>}>
          <LoginFormStyled />
        </Suspense>
      </div>
    </div>
  );
}
