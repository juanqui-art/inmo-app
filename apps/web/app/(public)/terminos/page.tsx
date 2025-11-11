import { FC } from "react";

const TerminosPage: FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-oslo-gray-900 dark:text-white mb-6">
        Términos de Uso
      </h1>
      <p className="mt-4 text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
        Bienvenido a InmoApp. Al acceder y utilizar nuestra plataforma, aceptas
        cumplir con los siguientes términos y condiciones de uso. Por favor,
        léelos detenidamente.
      </p>

      <div className="mt-8 space-y-8">
        {/* Section 1 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            1. Aceptación de los Términos
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Al utilizar InmoApp, confirmas que has leído, entendido y aceptado
            estos Términos de Uso, así como nuestra Política de Privacidad. Si
            no estás de acuerdo con alguno de estos términos, no debes utilizar
            nuestra plataforma.
          </p>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            2. Modificaciones de los Términos
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Nos reservamos el derecho de modificar estos Términos de Uso en
            cualquier momento. Cualquier cambio será efectivo inmediatamente
            después de su publicación en la plataforma. Tu uso continuado de
            InmoApp después de dichas modificaciones constituirá tu aceptación
            de los nuevos términos.
          </p>
        </div>

        {/* Section 3 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            3. Uso de la Plataforma
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            InmoApp es una plataforma para la búsqueda y publicación de
            propiedades inmobiliarias. Te comprometes a utilizar la plataforma
            de manera lícita y de acuerdo con estos Términos de Uso.
          </p>
          <ul className="list-disc list-inside text-oslo-gray-700 dark:text-oslo-gray-300 space-y-1 mt-2">
            <li>No utilizar la plataforma para fines ilegales o no autorizados.</li>
            <li>No interferir con la seguridad o el funcionamiento de InmoApp.</li>
            <li>No publicar contenido falso, engañoso o difamatorio.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            4. Contenido del Usuario
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Eres responsable del contenido que publicas en InmoApp. Al publicar
            contenido, nos otorgas una licencia no exclusiva, mundial, libre de
            regalías para usar, reproducir, modificar y distribuir dicho
            contenido en relación con la operación de la plataforma.
          </p>
        </div>

        {/* Section 5 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            5. Limitación de Responsabilidad
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            InmoApp se proporciona "tal cual" y "según disponibilidad". No
            garantizamos que la plataforma estará libre de errores o que su
            funcionamiento será ininterrumpido. No seremos responsables por
            daños directos, indirectos, incidentales, especiales o consecuentes
            que resulten del uso o la imposibilidad de usar la plataforma.
          </p>
        </div>

        {/* Section 6 */}
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-2">
            6. Ley Aplicable
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Estos Términos de Uso se regirán e interpretarán de acuerdo con las
            leyes del país donde InmoApp tiene su sede principal, sin dar
            efecto a sus principios de conflicto de leyes.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
          Para cualquier pregunta sobre estos términos, por favor{" "}
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

export default TerminosPage;
