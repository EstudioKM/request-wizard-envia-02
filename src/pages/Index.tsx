
import React from 'react';
import { Home, Inbox, Users, Calendar, BookOpen, Package, FileText, GitBranch, Tool, Settings, Tag, Zap, Webhook } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import CustomFieldsEditor from "@/components/CustomFieldsEditor";

const menuItems = [
  { icon: Home, label: 'Welcome', href: '#' },
  { icon: Inbox, label: 'Bandeja de Entrada', href: '#' },
  { icon: Users, label: 'Atención Humana', href: '#' },
  { icon: Tag, label: 'Oportunidades', href: '#' },
  { icon: Users, label: 'Contactos', href: '#' },
  { icon: BookOpen, label: 'Base de Conocimiento', href: '#' },
  { icon: Package, label: 'Productos', href: '#' },
  { icon: Calendar, label: 'Calendario', href: '#' },
  { icon: Users, label: 'Usuarios', href: '#' },
  { icon: FileText, label: 'Tutoriales', href: '#' },
  { icon: GitBranch, label: 'Flujos', href: '#' },
  { icon: Tool, label: 'Herramientas', href: '#' },
  { icon: Settings, label: 'Ajustes', href: '#' },
  { icon: Tag, label: 'Campos Personalizados', href: '#', isActive: true },
  { icon: Zap, label: 'Disparadores', href: '#' },
  { icon: Webhook, label: 'Webhook', href: '#' }
];

const Index = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className="text-lg font-semibold">Estudio KM</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.label}
                    isActive={item.isActive}
                  >
                    <a href={item.href} className="flex items-center">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="text-xs text-gray-500">estudio km</div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 overflow-auto p-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">
              <span className="text-gray-700">Hola,</span> 
              <span className="text-primary"> Estudio</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Esta es tu plataforma personalizada de Estudio KM.
            </p>
          </header>
          
          <div className="max-w-6xl mx-auto">
            <div className="app-card p-6">
              <CustomFieldsEditor />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
