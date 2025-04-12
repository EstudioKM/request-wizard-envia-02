
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Pencil, Trash, Copy, RefreshCw } from 'lucide-react';
import CreateCompanyDialog from './CreateCompanyDialog';
import { AuthService } from '@/services/AuthService';
import { Company } from '@/pages/Admin';

interface CompanyListProps {
  companies: Company[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

const CompanyList: React.FC<CompanyListProps> = ({ companies, isLoading, onRefresh }) => {
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  
  const handleDeleteCompany = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta empresa?")) {
      try {
        const result = await AuthService.deleteCompany(id);
        
        if (result) {
          toast.success("Empresa eliminada correctamente");
          onRefresh();
        } else {
          toast.error("Error al eliminar la empresa");
        }
      } catch (error: any) {
        console.error("Error deleting company:", error);
        toast.error("Error: " + error.message);
      }
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Token copiado al portapapeles");
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Empresas</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onRefresh}
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Actualizar
          </Button>
          
          <CreateCompanyDialog 
            open={companyModalOpen} 
            onOpenChange={setCompanyModalOpen} 
            onSuccess={onRefresh}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Token de API</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No hay empresas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="font-medium">{company.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm truncate max-w-[200px]">
                          {company.token}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(company.token)}
                          title="Copiar token"
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Editar empresa">
                          <Pencil size={14} />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteCompany(company.id)}
                          title="Eliminar empresa"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium mb-2">Uso del Token API</h3>
        <p className="text-sm text-gray-600 mb-2">
          El token de API es la llave de acceso para los endpoints donde se consultan los campos personalizados de cada empresa.
        </p>
        <div className="bg-gray-100 p-3 rounded-md">
          <code className="text-sm">
            GET /api/custom-fields?token=empresa-token-123
          </code>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Incluye este token en las peticiones HTTP para autenticar y autorizar el acceso a los datos específicos de cada empresa.
        </p>
      </div>
    </div>
  );
};

export default CompanyList;
