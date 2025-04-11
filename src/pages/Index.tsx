
import ExampleHttp from "@/components/ExampleHttp";
import HttpTester from "@/components/HttpTester";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">Módulo de Peticiones HTTP</h1>
        <div className="space-y-12">
          <HttpTester />
          <ExampleHttp />
        </div>
      </div>
    </div>
  );
};

export default Index;
