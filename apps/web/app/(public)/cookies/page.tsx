import { FC } from "react";

const CookiesPage: FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-oslo-gray-900 dark:text-white mb-6">
        Política de Cookies
      </h1>
      <p className="mt-4 text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
        Esta política explica cómo InmoApp utiliza cookies y tecnologías
        similares en nuestra plataforma.
      </p>

      <div className="mt-8 space-y-8">
        {/* Section 1 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            1. ¿Qué son las Cookies?
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Las cookies son pequeños archivos de texto que se almacenan en tu
            dispositivo (ordenador, tablet, móvil) cuando visitas un sitio web.
            Permiten que el sitio web recuerde tus acciones y preferencias
            (como inicio de sesión, idioma, tamaño de fuente y otras
            preferencias de visualización) durante un período de tiempo, para
            que no tengas que volver a introducirlas cada vez que regreses al
            sitio o navegues de una página a otra.
          </p>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            2. ¿Cómo Utilizamos las Cookies?
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Utilizamos cookies para varios propósitos:
          </p>
          <ul className="list-disc list-inside text-oslo-gray-700 dark:text-oslo-gray-300 space-y-1 mt-2">
            <li>
              <strong>Cookies Esenciales:</strong> Son necesarias para el
              funcionamiento básico de la plataforma, como mantener tu sesión
              iniciada.
            </li>
            <li>
              <strong>Cookies de Rendimiento:</strong> Nos ayudan a entender
              cómo los visitantes interactúan con InmoApp, proporcionando
              información sobre las áreas visitadas, el tiempo de permanencia
              en el sitio y cualquier problema encontrado, como mensajes de
              error.
            </li>
            <li>
              <strong>Cookies de Funcionalidad:</strong> Permiten que InmoApp
              recuerde las elecciones que haces (como tu nombre de usuario,
              idioma o la región en la que te encuentras) y proporcionan
              características mejoradas y más personales.
            </li>
            <li>
              <strong>Cookies de Publicidad:</strong> Se utilizan para mostrar
              anuncios más relevantes para ti y tus intereses. También se
              utilizan para limitar el número de veces que ves un anuncio, así
              como para ayudar a medir la efectividad de las campañas
              publicitarias.
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            3. Gestión de Cookies
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Puedes controlar y/o eliminar las cookies como desees. Puedes
            eliminar todas las cookies que ya están en tu ordenador y puedes
            configurar la mayoría de los navegadores para evitar que se
            almacenen. Sin embargo, si haces esto, es posible que tengas que
            ajustar manualmente algunas preferencias cada vez que visites un
            sitio y algunos servicios y funcionalidades pueden no funcionar.
          </p>
        </div>

        {/* Section 4 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            4. Consentimiento
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Al utilizar InmoApp, aceptas el uso de cookies de acuerdo con esta
            Política de Cookies. Si no estás de acuerdo con el uso de cookies,
            por favor, desactívalas siguiendo las instrucciones de tu navegador
            o abstente de utilizar nuestra plataforma.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
          Para más información sobre nuestra política de cookies, por favor{" "}
          <a
            href="/contacto"
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            contáctanos
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default CookiesPage;
