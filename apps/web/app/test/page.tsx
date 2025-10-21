import { DemoComponent } from '@/components/test/demo-component';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Página de Prueba
        </h1>

        <DemoComponent title="Demo Interactivo" />
      </div>
    </div>
  );
}
