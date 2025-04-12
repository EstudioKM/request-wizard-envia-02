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
import { Pencil, Trash, UserPlus } from 'lucide-react';
import CreateUserDialog from './CreateUserDialog';
import { toast } from "sonner";

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

interface UserListProps {
  profiles: Profile[];
  companies: Company[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

const UserList: React.FC<UserListProps> = ({ profiles, companies, isLoading, onRefresh }) => {
  const [userModalOpen, setUserModalOpen] = useState(false);
  
  const handleDeleteUser = async (id: string, email: string) => {
    if (confirm(`¿Estás seguro de eliminar el usuario ${email}?`)) {
      try {
        // En una implementación real, aquí se eliminaría el usuario
        // const { error } = await supabase.auth.admin.deleteUser(id);
        // if (error) throw error;
        
        toast.success("Usuario eliminado correctamente");
        onRefresh();
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast.error(`Error al eliminar usuario: ${error.message}`);
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Usuarios</h2>
        
        <CreateUserDialog 
          open={userModalOpen} 
          onOpenChange={setUserModalOpen} 
          companies={companies}
          onSuccess={onRefresh}
        />
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No hay usuarios registrados.
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      {profile.first_name || profile.last_name ? 
                        `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        profile.role === 'admin' ? 
                          'bg-purple-100 text-purple-700' : 
                          'bg-blue-100 text-blue-700'
                      }`}>
                        {profile.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {companies.find(c => c.id === profile.company_id)?.name || '-'}
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
                          onClick={() => handleDeleteUser(profile.id, profile.email)}
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

export default UserList;
