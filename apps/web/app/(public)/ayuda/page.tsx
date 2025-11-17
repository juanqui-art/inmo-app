import type { FC } from "react";

const AyudaPage: FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-oslo-gray-900 dark:text-white mb-6">
        Centro de Ayuda
      </h1>
      <p className="mt-4 text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
        Bienvenido a nuestro Centro de Ayuda. Aquí encontrarás respuestas a las
        preguntas más frecuentes y recursos para asistirte en tu experiencia con
        InmoApp.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-4">
            Preguntas Frecuentes
          </h2>
          <ul className="list-disc list-inside text-oslo-gray-700 dark:text-oslo-gray-300 space-y-2">
            <li>¿Cómo busco propiedades?</li>
            <li>¿Cómo publico una propiedad?</li>
            <li>¿Cómo contacto a un agente?</li>
            <li>¿Es InmoApp gratuito?</li>
          </ul>
          <a
            href="/faq"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            Ver todas las FAQs &rarr;
          </a>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-4">
            Guías y Tutoriales
          </h2>
          <ul className="list-disc list-inside text-oslo-gray-700 dark:text-oslo-gray-300 space-y-2">
            <li>Guía para Compradores</li>
            <li>Guía para Vendedores</li>
            <li>Cómo Usar el Mapa Interactivo</li>
            <li>Configuración de Alertas de Propiedades</li>
          </ul>
          <a
            href="#"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            Explorar Guías &rarr;
          </a>
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
          ¿No encuentras lo que buscas?{" "}
          <a
            href="/contacto"
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            Contáctanos directamente
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default AyudaPage;
