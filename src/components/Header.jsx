import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, Menu, X, User, Building2, LogOut, ChevronDown } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function Header({ user, tenant }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const canAccessDashboard = user && tenant && ['trialing', 'active'].includes(tenant.status);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to={canAccessDashboard ? createPageUrl('Dashboard') : '/'}
            className="flex items-center gap-2"
          >
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">VoteSecure</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#recursos" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Recursos
            </a>
            <a href="#planos" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Planos
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Sobre
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Contato
            </a>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 transition-colors rounded-full pl-3 pr-2 py-2">
                    <span className="text-sm font-medium text-blue-700 hidden sm:block">
                      {user.full_name || user.email}
                    </span>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(user.full_name)}
                    </div>
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {canAccessDashboard && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 cursor-pointer">
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('MeuPerfil')} className="flex items-center gap-2 cursor-pointer">
                          <User className="w-4 h-4" />
                          Meu Perfil
                        </Link>
                      </DropdownMenuItem>
                      {['Administrador', 'Presidente'].includes(user.perfil_tenant) && (
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('MinhaOrganizacao')} className="flex items-center gap-2 cursor-pointer">
                            <Building2 className="w-4 h-4" />
                            Minha Organização
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Entrar / Cadastrar
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4">
            <nav className="flex flex-col gap-2">
              <a href="#recursos" className="px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                Recursos
              </a>
              <a href="#planos" className="px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                Planos
              </a>
              <a href="#" className="px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                Sobre
              </a>
              <a href="#" className="px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                Contato
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}