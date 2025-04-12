
import React, { useEffect, useState } from 'react';
import { toast } from "sonner";
import AdminLayout from '@/components/admin/AdminLayout';
import CompanyList from '@/components/admin/CompanyList';
import UserList from '@/components/admin/UserList';
import { AuthService } from '@/services/AuthService';

// Define our types to match those expected by the components
export type Company = {
  id: string;
  name: string;
  token: string;
  created_at: string;
  updated_at?: string;
};

export type Profile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_id: string | null;
  role: string;
  created_at: string;
};

const Admin = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [currentTab, setCurrentTab] = useState<'companies' | 'users'>('companies');
  
  useEffect(() => {
    console.log("Admin component mounted, loading data...");
    loadCompanies();
    loadProfiles();
  }, []);
  
  const loadCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      // Obtener empresas de Supabase
      const companiesData = await AuthService.getCompanies();
      console.log("Empresas cargadas:", companiesData);
      
      if (companiesData && Array.isArray(companiesData)) {
        setCompanies(companiesData);
      } else {
        // Si no hay datos o no es un array, establecer un array vacío
        console.warn("No se encontraron empresas o el formato de datos es incorrecto");
        setCompanies([]);
      }
    } catch (error: any) {
      console.error("Error loading companies:", error);
      toast.error("Error al cargar empresas: " + error.message);
      // En caso de error, establecer un array vacío
      setCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };
  
  const loadProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      // Por ahora, solo tenemos los usuarios predefinidos
      const mockProfiles: Profile[] = [
        {
          id: "1",
          email: "admin@example.com",
          first_name: "Admin",
          last_name: "User",
          company_id: null,
          role: "admin",
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          email: "empresa@example.com",
          first_name: "Empresa",
          last_name: "Usuario",
          company_id: "1",
          role: "user",
          created_at: new Date().toISOString()
        }
      ];
      
      setProfiles(mockProfiles);
    } catch (error: any) {
      console.error("Error loading profiles:", error);
      toast.error("Error al cargar usuarios: " + error.message);
    } finally {
      setIsLoadingProfiles(false);
    }
  };
  
  return (
    <AdminLayout 
      currentTab={currentTab} 
      onTabChange={setCurrentTab}
    >
      {currentTab === 'companies' ? (
        <CompanyList 
          companies={companies} 
          isLoading={isLoadingCompanies} 
          onRefresh={loadCompanies} 
        />
      ) : (
        <UserList 
          profiles={profiles}
          companies={companies}
          isLoading={isLoadingProfiles} 
          onRefresh={loadProfiles} 
        />
      )}
    </AdminLayout>
  );
};

export default Admin;
