import { FC } from "react";

const NosotrosPage: FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-oslo-gray-900 dark:text-white mb-6">
        Sobre Nosotros
      </h1>
      <p className="mt-4 text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
        En InmoApp, nuestra misión es simplificar la búsqueda de propiedades y
        conectar a las personas con su hogar ideal. Creemos que encontrar el
        lugar perfecto para vivir o invertir debe ser una experiencia emocionante
        y sin estrés.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-4">
            Nuestra Visión
          </h2>
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300">
            Ser la plataforma líder en el mercado inmobiliario, reconocida por
            su innovación, transparencia y el compromiso con la satisfacción de
            nuestros usuarios. Aspiramos a transformar la manera en que las
            personas interactúan con el mundo de los bienes raíces.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-oslo-gray-800 dark:text-white mb-4">
            Nuestros Valores
          </h2>
          <ul className="list-disc list-inside text-oslo-gray-700 dark:text-oslo-gray-300 space-y-2">
            <li>
              <strong>Integridad:</strong> Actuamos con honestidad y ética en
              todas nuestras operaciones.
            </li>
            <li>
              <strong>Innovación:</strong> Buscamos constantemente nuevas formas
              de mejorar y ofrecer soluciones creativas.
            </li>
            <li>
              <strong>Cliente Primero:</strong> Nos dedicamos a entender y
              superar las expectativas de nuestros clientes.
            </li>
            <li>
              <strong>Transparencia:</strong> Ofrecemos información clara y
              precisa para facilitar decisiones informadas.
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-12 text-center">
        <h2 className="text-3xl font-bold text-oslo-gray-900 dark:text-white mb-4">
          Conoce a Nuestro Equipo
        </h2>
        <p className="text-lg text-oslo-gray-700 dark:text-oslo-gray-300">
          Estamos formados por un equipo de profesionales apasionados por el
          sector inmobiliario y la tecnología.
        </p>
        {/* You can add team member cards here */}
      </div>
    </div>
  );
};

export default NosotrosPage;
