
import ExampleHttp from "@/components/ExampleHttp";
import HttpTester from "@/components/HttpTester";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800">HTTP Client</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <HttpTester />
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-medium mb-6 text-gray-700">Ejemplos</h2>
            <ExampleHttp />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
