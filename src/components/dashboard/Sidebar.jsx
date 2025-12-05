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
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="p-4 border-b border-gray-200">
        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
          {!collapsed && <span className="text-xl font-bold text-gray-900">VoteSecure</span>}
        </Link>
      </div>

      {/* Tenant Info */}
      {!collapsed && tenant && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-900 truncate">{tenant.nome}</p>
          <p className="text-xs text-gray-500 truncate">{tenant.tipo_organizacao}</p>
          {tenant.status === 'trialing' && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              Em teste
            </span>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map(item => (
          <Link
            key={item.id}
            to={createPageUrl(item.page)}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive(item.page)
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.page) ? '' : 'text-gray-400'}`} />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse Button (Desktop) */}
      <div className="p-4 border-t border-gray-200 hidden lg:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCollapse}
          className="w-full justify-center"
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        <SidebarContent />
      </aside>
    </>
  );
}