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
      className="h-full w-full flex items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-oslo-gray-900 to-oslo-gray-800 hover:from-oslo-gray-800 hover:to-oslo-gray-700 border-2 border-dashed border-oslo-gray-700 hover:border-indigo-500 transition-all duration-300 group shadow-lg hover:shadow-xl"
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-oslo-gray-800 to-oslo-gray-900 group-hover:from-indigo-500 group-hover:to-indigo-600 flex items-center justify-center transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
            <ArrowRight className="w-8 h-8 text-indigo-400 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors duration-300">{title}</h3>
        <p className="text-oslo-gray-400 mt-2 group-hover:text-oslo-gray-300 transition-colors duration-300">{description}</p>
      </div>
    </Link>
  );
}
