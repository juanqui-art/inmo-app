import { FC } from "react";

const AgentesPage: FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-oslo-gray-900 dark:text-white mb-6">
        Nuestros Agentes
      </h1>
      <p className="mt-4 text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
        Conoce a nuestro equipo de agentes inmobiliarios expertos, listos para
        ayudarte a encontrar la propiedad perfecta o vender la tuya al mejor
        precio.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Example Agent Card */}
        <div className="bg-white dark:bg-oslo-gray-800 rounded-lg shadow-lg overflow-hidden text-center p-6">
          <img
            src="https://via.placeholder.com/150"
            alt="Agent Name"
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
          />
          <h3 className="text-xl font-semibold text-oslo-gray-900 dark:text-white mb-2">
            Juan Pérez
          </h3>
          <p className="text-indigo-600 dark:text-indigo-400 mb-2">
            Agente Senior
          </p>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300 text-sm">
            Especializado en propiedades residenciales de lujo en la zona
            metropolitana.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <a
              href="mailto:juan.perez@inmoapp.com"
              className="text-oslo-gray-400 hover:text-indigo-500 transition-colors"
            >
              Email
            </a>
            <a
              href="tel:+15551234567"
              className="text-oslo-gray-400 hover:text-indigo-500 transition-colors"
            >
              Teléfono
            </a>
          </div>
        </div>

        {/* Add more agent cards here */}
        <div className="bg-white dark:bg-oslo-gray-800 rounded-lg shadow-lg overflow-hidden text-center p-6">
          <img
            src="https://via.placeholder.com/150"
            alt="Agent Name"
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
          />
          <h3 className="text-xl font-semibold text-oslo-gray-900 dark:text-white mb-2">
            María García
          </h3>
          <p className="text-indigo-600 dark:text-indigo-400 mb-2">
            Agente Comercial
          </p>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300 text-sm">
            Experta en locales comerciales y oficinas en el centro de la ciudad.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <a
              href="mailto:maria.garcia@inmoapp.com"
              className="text-oslo-gray-400 hover:text-indigo-500 transition-colors"
            >
              Email
            </a>
            <a
              href="tel:+15559876543"
              className="text-oslo-gray-400 hover:text-indigo-500 transition-colors"
            >
              Teléfono
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-oslo-gray-800 rounded-lg shadow-lg overflow-hidden text-center p-6">
          <img
            src="https://via.placeholder.com/150"
            alt="Agent Name"
            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
          />
          <h3 className="text-xl font-semibold text-oslo-gray-900 dark:text-white mb-2">
            Carlos Ruíz
          </h3>
          <p className="text-indigo-600 dark:text-indigo-400 mb-2">
            Especialista en Inversiones
          </p>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300 text-sm">
            Asesoramiento experto en oportunidades de inversión inmobiliaria y
            rentabilidad.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <a
              href="mailto:carlos.ruiz@inmoapp.com"
              className="text-oslo-gray-400 hover:text-indigo-500 transition-colors"
            >
              Email
            </a>
            <a
              href="tel:+15552468135"
              className="text-oslo-gray-400 hover:text-indigo-500 transition-colors"
            >
              Teléfono
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentesPage;
