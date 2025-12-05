import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Building2,
  UserCog,
  FileText,
  User,
  Menu,
  X,
  Shield,
  ChevronLeft,
  ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  { 
    id: 'dashboard',
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    page: 'Dashboard',
    roles: ['Administrador', 'Presidente', 'Secretário', 'Membro Votante', 'Observador']
  },
  { 
    id: 'membros',
    label: 'Membros', 
    icon: Users, 
    page: 'Membros',
    roles: ['Administrador', 'Presidente', 'Secretário']
  },
  { 
    id: 'assembleias',
    label: 'Assembleias', 
    icon: CalendarDays, 
    page: 'Assembleias',
    roles: ['Administrador', 'Presidente', 'Secretário']
  },
  { 
    id: 'procuracoes',
    label: 'Procurações', 
    icon: ScrollText, 
    page: 'Procuracoes',
    roles: ['Administrador', 'Presidente', 'Secretário']
  },
  { 
    id: 'organizacao',
    label: 'Minha Organização', 
    icon: Building2, 
    page: 'MinhaOrganizacao',
    roles: ['Administrador', 'Presidente']
  },
  { 
    id: 'usuarios',
    label: 'Usuários', 
    icon: UserCog, 
    page: 'Usuarios',
    roles: ['Administrador']
  },
  { 
    id: 'logs',
    label: 'Logs de Auditoria', 
    icon: FileText, 
    page: 'Logs',
    roles: ['Administrador']
  },
  { 
    id: 'perfil',
    label: 'Meu Perfil', 
    icon: User, 
    page: 'MeuPerfil',
    roles: ['Administrador', 'Presidente', 'Secretário', 'Membro Votante', 'Observador']
  }
];

export default function Sidebar({ user, tenant, collapsed, onCollapse }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = user?.perfil_tenant || 'Membro Votante';

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const isActive = (page) => {
    const pageUrl = createPageUrl(page);
    return location.pathname === pageUrl || location.pathname.startsWith(pageUrl + '/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200" style={{ borderColor: '#E0E0E0' }}>
        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
          <Shield className="w-8 h-8 flex-shrink-0" style={{ color: '#1976D2' }} />
          {!collapsed && <span className="text-xl font-bold" style={{ color: '#212121' }}>VoteSecure</span>}
        </Link>
      </div>

      {/* Tenant Info */}
      {!collapsed && tenant && (
        <div className="p-4 border-b" style={{ borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' }}>
          <p className="text-sm font-medium truncate" style={{ color: '#212121' }}>{tenant.nome}</p>
          <p className="text-xs truncate" style={{ color: '#757575' }}>{tenant.tipo_organizacao}</p>
          {tenant.status === 'trialing' && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}>
              Em teste
            </span>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <TooltipProvider delayDuration={300}>
          {filteredMenuItems.map(item => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Link
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] ${
                    isActive(item.page)
                      ? 'text-white shadow-md'
                      : 'hover:bg-opacity-10'
                  }`}
                  style={{
                    backgroundColor: isActive(item.page) ? '#1976D2' : 'transparent',
                    color: isActive(item.page) ? 'white' : '#757575',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.page)) {
                      e.currentTarget.style.backgroundColor = '#BBDEFB';
                      e.currentTarget.style.color = '#1976D2';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.page)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#757575';
                    }
                  }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-gray-900 text-white text-sm">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* Collapse Button (Desktop) */}
      <div className="p-4 border-t hidden lg:block" style={{ borderColor: '#E0E0E0' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCollapse}
          className="w-full justify-center hover:bg-blue-50"
          style={{ color: '#757575' }}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
        style={{ 
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          color: '#757575'
        }}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ boxShadow: mobileOpen ? '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)' : 'none' }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100"
          style={{ color: '#757575' }}
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block fixed top-0 left-0 h-full bg-white transition-all duration-300 z-40 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
        style={{ 
          borderRight: '1px solid #E0E0E0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}