import { FC } from "react";

const BlogPage: FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-oslo-gray-900 dark:text-white mb-6">
        Nuestro Blog
      </h1>
      <p className="mt-4 text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
        Bienvenido a nuestro blog, donde compartimos las últimas noticias,
        tendencias del mercado inmobiliario y consejos útiles para compradores
        y vendedores.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Example Blog Post Card */}
        <div className="bg-white dark:bg-oslo-gray-800 rounded-lg shadow-lg overflow-hidden">
          <img
            src="https://via.placeholder.com/400x250"
            alt="Blog Post Image"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold text-oslo-gray-900 dark:text-white mb-2">
              Guía para Comprar tu Primera Casa
            </h3>
            <p className="text-oslo-gray-600 dark:text-oslo-gray-400 text-sm mb-4">
              Fecha: 10 de Noviembre, 2025
            </p>
            <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
              Descubre los pasos esenciales para adquirir tu primera propiedad
              sin complicaciones.
            </p>
            <a
              href="#"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Leer más &rarr;
            </a>
          </div>
        </div>

        {/* Add more blog post cards here */}
        <div className="bg-white dark:bg-oslo-gray-800 rounded-lg shadow-lg overflow-hidden">
          <img
            src="https://via.placeholder.com/400x250"
            alt="Blog Post Image"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold text-oslo-gray-900 dark:text-white mb-2">
              Tendencias del Mercado Inmobiliario 2025
            </h3>
            <p className="text-oslo-gray-600 dark:text-oslo-gray-400 text-sm mb-4">
              Fecha: 5 de Noviembre, 2025
            </p>
            <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
              Un análisis profundo de lo que depara el mercado de bienes raíces
              el próximo año.
            </p>
            <a
              href="#"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Leer más &rarr;
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-oslo-gray-800 rounded-lg shadow-lg overflow-hidden">
          <img
            src="https://via.placeholder.com/400x250"
            alt="Blog Post Image"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold text-oslo-gray-900 dark:text-white mb-2">
              Invertir en Propiedades de Alquiler
            </h3>
            <p className="text-oslo-gray-600 dark:text-oslo-gray-400 text-sm mb-4">
              Fecha: 1 de Noviembre, 2025
            </p>
            <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
              Maximiza tus ingresos con nuestra guía completa para invertir en
              propiedades de alquiler.
            </p>
            <a
              href="#"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              Leer más &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;