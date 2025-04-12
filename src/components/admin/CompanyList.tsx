
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
import { Key, Pencil, Trash } from 'lucide-react';
import CreateCompanyDialog from './CreateCompanyDialog';
import { AuthService } from '@/services/AuthService';

type Company = {
  id: string;
  name: string;
  token: string;
};

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
        const result = AuthService.deleteCompany(id);
        
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Empresas</h2>
        
        <CreateCompanyDialog 
          open={companyModalOpen} 
          onOpenChange={setCompanyModalOpen} 
          onSuccess={onRefresh}
        />
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Token</TableHead>
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
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                          {company.token.substring(0, 15)}...
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(company.token);
                            toast.success("Token copiado al portapapeles");
                          }}
                        >
                          <Key size={14} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Pencil size={14} />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteCompany(company.id)}
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
    </div>
  );
};

export default CompanyList;
