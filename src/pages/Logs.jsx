import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  User,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function Logs() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcao, setFilterAcao] = useState('all');

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

      // Load logs from database
      const logsData = await base44.entities.LogAuditoria.filter({ tenant_id: tenants[0].id });
      // Sort by created_date descending
      const sortedLogs = logsData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setLogs(sortedLogs);

    } catch (error) {
      console.error('Error loading:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const getAcaoBadgeStyle = (acao) => {
    const styles = {
      'Criar': { backgroundColor: '#E8F5E9', color: '#4CAF50' },
      'Atualizar': { backgroundColor: '#BBDEFB', color: '#1976D2' },
      'Excluir': { backgroundColor: '#FFEBEE', color: '#F44336' },
      'Login': { backgroundColor: '#E1BEE7', color: '#7B1FA2' },
      'Logout': { backgroundColor: '#F5F5F5', color: '#757575' },
      'Votar': { backgroundColor: '#E8EAF6', color: '#3F51B5' },
      'Check-in': { backgroundColor: '#E0F7FA', color: '#00ACC1' }
    };
    return styles[acao] || { backgroundColor: '#F5F5F5', color: '#757575' };
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.usuario_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.acao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entidade_afetada?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAcao = filterAcao === 'all' || log.acao === filterAcao;
    return matchesSearch && matchesAcao;
  });

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#212121' }}>Logs de Auditoria</h1>
            <p style={{ color: '#757575' }}>Registro de todas as ações realizadas no sistema</p>
          </div>

          {/* Filters */}
          <Card 
            className="mb-6"
            style={{ 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
              borderRadius: '8px',
              border: 'none'
            }}
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por usuário, ação ou entidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterAcao} onValueChange={setFilterAcao}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Tipo de Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    <SelectItem value="Criar">Criar</SelectItem>
                    <SelectItem value="Atualizar">Atualizar</SelectItem>
                    <SelectItem value="Excluir">Excluir</SelectItem>
                    <SelectItem value="Login">Login</SelectItem>
                    <SelectItem value="Logout">Logout</SelectItem>
                    <SelectItem value="Votar">Votar</SelectItem>
                    <SelectItem value="Check-in">Check-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card
            style={{ 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
              borderRadius: '8px',
              border: 'none'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#212121' }}>
                <Activity className="w-5 h-5" style={{ color: '#1976D2' }} />
                Histórico de Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum log encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {format(new Date(log.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{log.usuario_nome || 'Sistema'}</span>
                            <span className="text-xs text-gray-500">{log.usuario_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge style={getAcaoBadgeStyle(log.acao)}>
                            {log.acao}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.entidade_afetada}</TableCell>
                        <TableCell className="max-w-xs truncate" title={log.detalhes}>
                          {log.detalhes}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="mt-4 text-sm text-gray-500">
            Mostrando {filteredLogs.length} registros
          </div>
        </main>
      </div>
    </div>
  );
}