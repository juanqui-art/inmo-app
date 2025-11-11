import { FC } from "react";

const PrivacidadPage: FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-oslo-gray-900 dark:text-white mb-6">
        Política de Privacidad
      </h1>
      <p className="mt-4 text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
        En InmoApp, nos comprometemos a proteger tu privacidad. Esta política
        explica cómo recopilamos, usamos y protegemos tu información personal.
      </p>

      <div className="mt-8 space-y-8">
        {/* Section 1 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            1. Información que Recopilamos
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Recopilamos información que nos proporcionas directamente, como tu
            nombre, dirección de correo electrónico y número de teléfono cuando
            te registras, publicas una propiedad o nos contactas. También
            recopilamos información automáticamente a través de cookies y
            tecnologías similares, como tu dirección IP, tipo de navegador y
            páginas visitadas.
          </p>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            2. Uso de la Información
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Utilizamos la información recopilada para:
          </p>
          <ul className="list-disc list-inside text-oslo-gray-700 dark:text-oslo-gray-300 space-y-1 mt-2">
            <li>Proveer y mejorar nuestros servicios.</li>
            <li>Personalizar tu experiencia en InmoApp.</li>
            <li>Comunicarnos contigo sobre tu cuenta o servicios.</li>
            <li>Detectar y prevenir fraudes o actividades ilegales.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            3. Compartir Información
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            No vendemos ni alquilamos tu información personal a terceros.
            Podemos compartir tu información con proveedores de servicios que
            nos ayudan a operar la plataforma (por ejemplo, alojamiento web,
            análisis de datos), siempre bajo estrictos acuerdos de
            confidencialidad. También podemos divulgar información si es
            requerido por ley.
          </p>
        </div>

        {/* Section 4 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            4. Seguridad de la Información
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Implementamos medidas de seguridad técnicas y organizativas para
            proteger tu información personal contra el acceso no autorizado,
            la divulgación, alteración o destrucción.
          </p>
        </div>

        {/* Section 5 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            5. Tus Derechos
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Tienes derecho a acceder, corregir o eliminar tu información
            personal. También puedes oponerte al procesamiento de tus datos o
            solicitar la limitación de su uso. Para ejercer estos derechos,
            por favor, contáctanos.
          </p>
        </div>

        {/* Section 6 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            6. Cambios a esta Política
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Podemos actualizar esta Política de Privacidad ocasionalmente. Te
            notificaremos sobre cualquier cambio significativo publicando la
            nueva política en nuestra plataforma.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
          Para cualquier pregunta sobre nuestra política de privacidad, por
          favor{" "}
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

export default PrivacidadPage;
