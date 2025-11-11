import { FC } from "react";

const ContactoPage: FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-oslo-gray-900 dark:text-white mb-6">
        Contacto
      </h1>
      <p className="mt-4 text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
        Ponte en contacto con nosotros. Estamos aquí para ayudarte con cualquier
        pregunta o consulta que tengas.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-4">
            Información de Contacto
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            <strong>Email:</strong> info@inmoapp.com
          </p>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            <strong>Teléfono:</strong> +1 (555) 123-4567
          </p>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            <strong>Dirección:</strong> 123 Calle Falsa, Ciudad Ficticia, País
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-4">
            Envíanos un Mensaje
          </h2>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-oslo-gray-700 dark:text-oslo-gray-300"
              >
                Nombre
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-oslo-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-oslo-gray-800 dark:border-oslo-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-oslo-gray-700 dark:text-oslo-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-oslo-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-oslo-gray-800 dark:border-oslo-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-oslo-gray-700 dark:text-oslo-gray-300"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                rows={4}
                className="mt-1 block w-full rounded-md border-oslo-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-oslo-gray-800 dark:border-oslo-gray-700 dark:text-white"
              ></textarea>
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactoPage;
