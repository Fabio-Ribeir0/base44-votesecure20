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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bell, User, Building2, LogOut, ChevronDown, Settings, CreditCard } from "lucide-react";
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
    <header 
      className="h-16 bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30"
      style={{ 
        borderBottom: '1px solid #E0E0E0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
      }}
    >
      {/* Left - Page Title or Search */}
      <div className="flex items-center gap-4">
        {/* Spacer for mobile menu button */}
        <div className="w-10 lg:hidden" />
        
        {trialDays !== null && (
          <Badge 
            variant="outline" 
            className="text-xs sm:text-sm"
            style={{ backgroundColor: '#FFF3E0', color: '#E65100', borderColor: '#FFB74D' }}
          >
            {trialDays} dias restantes no trial
          </Badge>
        )}
      </div>

      {/* Right - User Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Upgrade Button for Trialing */}
        {tenant?.status === 'trialing' && (
          <Link 
            to={createPageUrl('MinhaOrganizacao')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ 
              backgroundColor: '#1976D2', 
              color: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1565C0';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1976D2';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)';
            }}
          >
            <CreditCard className="w-4 h-4" />
            Ativar Plano
          </Link>
        )}

        {/* Notifications */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="relative p-2.5 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ color: '#757575' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F5F5';
                  e.currentTarget.style.color = '#1976D2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#757575';
                }}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: '#F44336' }}></span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white text-sm">
              Notificações
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex items-center gap-2 rounded-full pl-3 pr-2 py-1.5 transition-all duration-200 min-h-[44px]"
              style={{ backgroundColor: '#F5F5F5' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EEEEEE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F5';
              }}
            >
              <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate" style={{ color: '#212121' }}>
                {user?.full_name || user?.email}
              </span>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: '#1976D2' }}
              >
                {getInitials(user?.full_name)}
              </div>
              <ChevronDown className="w-4 h-4" style={{ color: '#757575' }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56"
            style={{ 
              boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
              borderRadius: '8px',
              border: '1px solid #E0E0E0'
            }}
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium" style={{ color: '#212121' }}>{user?.full_name}</p>
              <p className="text-xs" style={{ color: '#757575' }}>{user?.email}</p>
              <Badge 
                variant="secondary" 
                className="mt-1.5 text-xs"
                style={{ backgroundColor: '#BBDEFB', color: '#1976D2' }}
              >
                {user?.perfil_tenant || 'Membro'}
              </Badge>
            </div>
            <DropdownMenuSeparator style={{ backgroundColor: '#E0E0E0' }} />
            <DropdownMenuItem asChild>
              <Link 
                to={createPageUrl('MeuPerfil')} 
                className="flex items-center gap-2 cursor-pointer py-2.5 px-3 min-h-[44px]"
                style={{ color: '#212121' }}
              >
                <User className="w-4 h-4" style={{ color: '#757575' }} />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            {['Administrador', 'Presidente'].includes(user?.perfil_tenant) && (
              <DropdownMenuItem asChild>
                <Link 
                  to={createPageUrl('MinhaOrganizacao')} 
                  className="flex items-center gap-2 cursor-pointer py-2.5 px-3 min-h-[44px]"
                  style={{ color: '#212121' }}
                >
                  <Building2 className="w-4 h-4" style={{ color: '#757575' }} />
                  Minha Organização
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator style={{ backgroundColor: '#E0E0E0' }} />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="flex items-center gap-2 cursor-pointer py-2.5 px-3 min-h-[44px]"
              style={{ color: '#F44336' }}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}