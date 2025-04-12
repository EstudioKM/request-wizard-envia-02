
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
      // Get companies from AuthService
      const companiesData = await AuthService.getCompanies();
      console.log("Empresas cargadas:", companiesData);
      
      if (companiesData && Array.isArray(companiesData)) {
        setCompanies(companiesData);
      } else {
        // If no data or wrong format, set empty array
        console.warn("No se encontraron empresas o el formato de datos es incorrecto");
        setCompanies([]);
      }
    } catch (error: any) {
      console.error("Error loading companies:", error);
      toast.error("Error al cargar empresas: " + error.message);
      setCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };
  
  const loadProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      // Load profiles using the mock data from AuthService
      const profilesData = await AuthService.getProfiles();
      
      if (profilesData) {
        console.log("Perfiles cargados:", profilesData);
        setProfiles(profilesData);
      } else {
        console.log("No se encontraron perfiles, usando datos predefinidos");
        setProfiles([]);
      }
    } catch (error: any) {
      console.error("Error loading profiles:", error);
      setProfiles([]);
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
