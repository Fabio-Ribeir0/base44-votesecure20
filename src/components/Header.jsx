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
import { Shield, Menu, X, User, Building2, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
      style={{
        backgroundColor: isScrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(8px)' : 'none',
        boxShadow: isScrolled ? '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' : 'none'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to={canAccessDashboard ? createPageUrl('Dashboard') : '/'}
            className="flex items-center gap-2"
          >
            <Shield className="w-8 h-8" style={{ color: '#1976D2' }} />
            <span className="text-xl font-bold" style={{ color: '#212121' }}>VoteSecure</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {['Recursos', 'Planos', 'Sobre', 'Contato'].map((item) => (
              <a 
                key={item}
                href={item === 'Recursos' ? '#recursos' : item === 'Planos' ? '#planos' : '#'} 
                className="font-medium transition-all duration-200 py-2"
                style={{ color: '#757575' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1976D2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#757575';
                }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-2 rounded-full pl-3 pr-2 py-2 min-h-[44px] transition-all duration-200"
                    style={{ backgroundColor: '#BBDEFB' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#90CAF9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#BBDEFB';
                    }}
                  >
                    <span className="text-sm font-medium hidden sm:block" style={{ color: '#1976D2' }}>
                      {user.full_name || user.email}
                    </span>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: '#1976D2' }}
                    >
                      {getInitials(user.full_name)}
                    </div>
                    <ChevronDown className="w-4 h-4" style={{ color: '#1976D2' }} />
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
                    <p className="text-sm font-medium" style={{ color: '#212121' }}>{user.full_name}</p>
                    <p className="text-xs" style={{ color: '#757575' }}>{user.email}</p>
                  </div>
                  <DropdownMenuSeparator style={{ backgroundColor: '#E0E0E0' }} />
                  {canAccessDashboard && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link 
                          to={createPageUrl('Dashboard')} 
                          className="flex items-center gap-2 cursor-pointer py-2.5 px-3 min-h-[44px]"
                          style={{ color: '#212121' }}
                        >
                          <LayoutDashboard className="w-4 h-4" style={{ color: '#757575' }} />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
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
                      {['Administrador', 'Presidente'].includes(user.perfil_tenant) && (
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
                    </>
                  )}
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
            ) : (
              <Button 
                onClick={handleLogin}
                className="text-white px-6 min-h-[44px] transition-all duration-200"
                style={{ 
                  backgroundColor: '#1976D2', 
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1565C0';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1976D2';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)';
                }}
              >
                Entrar / Cadastrar
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden py-4"
            style={{ 
              backgroundColor: 'white', 
              borderTop: '1px solid #E0E0E0',
              boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
            }}
          >
            <nav className="flex flex-col gap-1">
              {['Recursos', 'Planos', 'Sobre', 'Contato'].map((item) => (
                <a 
                  key={item}
                  href={item === 'Recursos' ? '#recursos' : item === 'Planos' ? '#planos' : '#'} 
                  className="px-4 py-3 rounded-lg transition-all duration-200 min-h-[44px] flex items-center"
                  style={{ color: '#757575' }}
                  onClick={() => setMobileMenuOpen(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#BBDEFB';
                    e.currentTarget.style.color = '#1976D2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#757575';
                  }}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}