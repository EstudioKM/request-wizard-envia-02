
import CustomFieldsEditor from "@/components/CustomFieldsEditor";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800">Editor de Campos Personalizados</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <CustomFieldsEditor />
        </div>
      </div>
    </div>
  );
};

export default Index;
