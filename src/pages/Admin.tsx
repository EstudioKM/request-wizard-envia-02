
import React, { useEffect, useState } from 'react';
import { getAdminClient } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminLayout from '@/components/admin/AdminLayout';
import CompanyList from '@/components/admin/CompanyList';
import UserList from '@/components/admin/UserList';

type Company = {
  id: string;
  name: string;
  token: string;
  created_at: string;
};

type Profile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_id: string | null;
  role: string;
  created_at: string;
};

type AuthUser = {
  id: string;
  email?: string;
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
      console.log("Loading companies...");
      const adminClient = getAdminClient();
      console.log("Admin client created for companies");
      
      const { data, error } = await adminClient
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error loading companies:", error);
        toast.error("Error al cargar empresas: " + error.message);
      } else {
        console.log("Companies loaded successfully:", data);
        setCompanies(data || []);
      }
    } catch (error: any) {
      console.error("Exception loading companies:", error);
      toast.error("Error inesperado al cargar empresas");
    } finally {
      setIsLoadingCompanies(false);
    }
  };
  
  const loadProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      console.log("Loading profiles...");
      const adminClient = getAdminClient();
      console.log("Admin client created for profiles");
      
      const authUsers: { users: AuthUser[] } = { users: [] };
      
      try {
        const { data: authUsersData, error: authError } = await adminClient.auth.admin.listUsers();
        
        if (authError) {
          console.error("Error loading auth users:", authError);
          toast.error("Error al cargar usuarios de autenticación: " + authError.message);
        } else if (authUsersData) {
          Object.assign(authUsers, authUsersData);
        }
      } catch (authErr: any) {
        console.error("Exception loading auth users:", authErr);
      }
      
      const { data: profilesData, error: profilesError } = await adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        console.error("Error loading profiles:", profilesError);
        toast.error("Error al cargar perfiles: " + profilesError.message);
        return;
      }
      
      console.log("Profiles loaded successfully:", profilesData);
      
      const profiles = profilesData || [];
      
      const combinedProfiles = profiles.map(profile => {
        if (!profile || !profile.id) {
          console.error("Invalid profile object:", profile);
          return {
            id: 'unknown',
            email: 'error@example.com',
            first_name: null,
            last_name: null,
            company_id: null,
            role: 'unknown',
            created_at: new Date().toISOString()
          };
        }
        
        const authUser = authUsers.users.find(u => u.id === profile.id);
        return {
          ...profile,
          email: authUser?.email || profile.email || 'Sin email'
        };
      });
      
      setProfiles(combinedProfiles);
    } catch (error: any) {
      console.error("Exception loading profiles:", error);
      toast.error("Error inesperado al cargar usuarios: " + error.message);
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
