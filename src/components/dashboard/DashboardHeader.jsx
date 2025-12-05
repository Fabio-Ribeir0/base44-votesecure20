import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, Building2, LogOut, ChevronDown, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardHeader({ user, tenant }) {
  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTrialDaysLeft = () => {
    if (tenant?.status !== 'trialing' || !tenant?.data_fim_trial) return null;
    const endDate = new Date(tenant.data_fim_trial);
    const now = new Date();
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const trialDays = getTrialDaysLeft();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left - Page Title or Search */}
      <div className="flex items-center gap-4">
        {/* Spacer for mobile menu button */}
        <div className="w-10 lg:hidden" />
        
        {trialDays !== null && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {trialDays} dias restantes no trial
          </Badge>
        )}
      </div>

      {/* Right - User Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full pl-3 pr-2 py-1.5">
              <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">
                {user?.full_name || user?.email}
              </span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(user?.full_name)}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {user?.perfil_tenant || 'Membro'}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={createPageUrl('MeuPerfil')} className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            {['Administrador', 'Presidente'].includes(user?.perfil_tenant) && (
              <DropdownMenuItem asChild>
                <Link to={createPageUrl('MinhaOrganizacao')} className="flex items-center gap-2 cursor-pointer">
                  <Building2 className="w-4 h-4" />
                  Minha Organização
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600">
              <LogOut className="w-4 h-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}