import { FC } from "react";

const FAQPage: FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-oslo-gray-900 dark:text-white mb-6">
        Preguntas Frecuentes
      </h1>
      <p className="mt-4 text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
        Aquí encontrarás respuestas a las preguntas más comunes sobre InmoApp y
        nuestros servicios.
      </p>

      <div className="mt-8 space-y-8">
        {/* FAQ Item 1 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            ¿Cómo puedo buscar propiedades en InmoApp?
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Puedes buscar propiedades utilizando la barra de búsqueda en la
            página principal. Puedes filtrar por ubicación, tipo de propiedad,
            rango de precios y más.
          </p>
        </div>

        {/* FAQ Item 2 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            ¿Es gratuito el uso de InmoApp para buscar propiedades?
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Sí, buscar propiedades en InmoApp es completamente gratuito para
            todos los usuarios.
          </p>
        </div>

        {/* FAQ Item 3 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            ¿Cómo puedo contactar a un agente?
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            En cada página de detalle de propiedad, encontrarás la información
            de contacto del agente responsable. También puedes visitar nuestra
            sección de "Agentes" para ver el perfil de todos nuestros
            profesionales.
          </p>
        </div>

        {/* FAQ Item 4 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            ¿Cómo puedo publicar mi propiedad en InmoApp?
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Si eres un agente o propietario y deseas publicar tu propiedad,
            por favor, contáctanos a través de nuestra página de "Contacto"
            para más información.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
          ¿Tienes otra pregunta?{" "}
          <a
            href="/contacto"
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            Envíanos un mensaje
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default FAQPage;
