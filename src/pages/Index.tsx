
import CustomFieldsEditor from "@/components/CustomFieldsEditor";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-semibold text-center mb-2 text-gray-800">Campos Personalizados EstudioKM</h1>
        <p className="text-center text-gray-500 mb-8">Visualización de campos personalizados con valores y descripciones</p>
        
        <div className="grid grid-cols-1 gap-8">
          <CustomFieldsEditor />
        </div>
      </div>
    </div>
  );
};

export default Index;
