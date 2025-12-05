import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { 
  UserCog, 
  Search, 
  Mail,
  Shield,
  UserPlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ConviteUsuarioModal from '@/components/usuarios/ConviteUsuarioModal';

const PERFIS = ['Administrador', 'Presidente', 'Secretário', 'Observador', 'Membro Votante'];

export default function Usuarios() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConviteModal, setShowConviteModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        navigate('/');
        return;
      }

      const userData = await base44.auth.me();
      setUser(userData);

      if (userData.perfil_tenant !== 'Administrador') {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      if (!userData.tenant_id) {
        navigate('/');
        return;
      }

      const tenants = await base44.entities.Tenant.filter({ id: userData.tenant_id });
      if (tenants.length === 0 || !['trialing', 'active'].includes(tenants[0].status)) {
        navigate('/');
        return;
      }

      setTenant(tenants[0]);

      // Load users with same tenant
      const allUsers = await base44.entities.User.filter({ tenant_id: userData.tenant_id });
      setUsuarios(allUsers);

    } catch (error) {
      console.error('Error loading:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerfilChange = async (userId, newPerfil) => {
    try {
      await base44.entities.User.update(userId, { perfil_tenant: newPerfil });
      toast.success('Perfil atualizado com sucesso!');
      loadData();
    } catch (error) {
      console.error('Error updating perfil:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  const filteredUsuarios = usuarios.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPerfilBadgeStyle = (perfil) => {
    const styles = {
      'Administrador': { backgroundColor: '#FFEBEE', color: '#F44336' },
      'Presidente': { backgroundColor: '#E1BEE7', color: '#7B1FA2' },
      'Secretário': { backgroundColor: '#BBDEFB', color: '#1976D2' },
      'Observador': { backgroundColor: '#F5F5F5', color: '#757575' },
      'Membro Votante': { backgroundColor: '#E8F5E9', color: '#4CAF50' }
    };
    return styles[perfil] || { backgroundColor: '#F5F5F5', color: '#757575' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#1976D2', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Sidebar 
        user={user} 
        tenant={tenant} 
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <DashboardHeader user={user} tenant={tenant} />
        
        <main className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#212121' }}>Usuários e Permissões</h1>
              <p style={{ color: '#757575' }}>Gerencie os usuários e seus perfis de acesso</p>
            </div>
            <Button 
              onClick={() => setShowConviteModal(true)} 
              className="text-white min-h-[44px] transition-all duration-200"
              style={{ 
                backgroundColor: '#1976D2',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1565C0';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1976D2';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Convidar Usuário
            </Button>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card
            style={{ 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
              borderRadius: '8px',
              border: 'none'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#212121' }}>
                <Shield className="w-5 h-5" style={{ color: '#1976D2' }} />
                Usuários do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil Atual</TableHead>
                    <TableHead>Alterar Perfil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {usuario.full_name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{usuario.full_name || 'Sem nome'}</p>
                              {usuario.id === user.id && (
                                <Badge variant="secondary" className="text-xs">Você</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {usuario.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge style={getPerfilBadgeStyle(usuario.perfil_tenant)}>
                            {usuario.perfil_tenant || 'Membro Votante'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={usuario.perfil_tenant || 'Membro Votante'}
                            onValueChange={(value) => handlePerfilChange(usuario.id, value)}
                            disabled={usuario.id === user.id}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PERFIS.map(perfil => (
                                <SelectItem key={perfil} value={perfil}>{perfil}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="mt-4 text-sm text-gray-500">
            Total: {filteredUsuarios.length} usuários
          </div>
          </main>
          </div>

          <ConviteUsuarioModal
          open={showConviteModal}
          onOpenChange={setShowConviteModal}
          tenantId={tenant?.id}
          tenantNome={tenant?.nome}
          onSuccess={loadData}
          />
          </div>
          );
          }