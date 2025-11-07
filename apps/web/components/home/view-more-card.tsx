import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ViewMoreCardProps {
  href: string;
  title?: string;
  description?: string;
}

export function ViewMoreCard({
  href,
  title = "Ver Más Propiedades",
  description = "Explora nuestro catálogo completo.",
}: ViewMoreCardProps) {
  return (
    <Link
      href={href}
      className="h-full w-full flex items-center justify-center p-4 rounded-2xl bg-oslo-gray-900 hover:bg-oslo-gray-800 border-2 border-dashed border-oslo-gray-700 hover:border-indigo-500 transition-all duration-300 group"
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-oslo-gray-800 group-hover:bg-indigo-500 flex items-center justify-center transition-colors duration-300">
            <ArrowRight className="w-8 h-8 text-indigo-400 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-oslo-gray-400 mt-1">{description}</p>
      </div>
    </Link>
  );
}
