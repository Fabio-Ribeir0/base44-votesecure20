import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Search,
  Edit,
  XCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProcuracaoFormModal from '@/components/procuracao/ProcuracaoFormModal';

export default function Procuracoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [procuracoes, setProcuracoes] = useState([]);
  const [membros, setMembros] = useState([]);
  const [assembleias, setAssembleias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProcuracao, setEditingProcuracao] = useState(null);

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
      
      const [procData, membrosData, assembleiasData] = await Promise.all([
        base44.entities.Procuracao.filter({ tenant_id: tenants[0].id }),
        base44.entities.Membro.filter({ tenant_id: tenants[0].id }),
        base44.entities.Assembleia.filter({ tenant_id: tenants[0].id })
      ]);
      
      setProcuracoes(procData);
      setMembros(membrosData);
      setAssembleias(assembleiasData);

    } catch (error) {
      console.error('Error loading:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (procuracao, newStatus) => {
    try {
      await base44.entities.Procuracao.update(procuracao.id, { status: newStatus });
      toast.success(`Procuração ${newStatus === 'Revogada' ? 'revogada' : 'atualizada'}`);
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getMemberName = (id) => {
    const membro = membros.find(m => m.id === id);
    return membro?.nome_completo || 'Desconhecido';
  };

  const getAssembleiaName = (id) => {
    if (!id) return 'Todas';
    const assembleia = assembleias.find(a => a.id === id);
    return assembleia?.nome || 'Desconhecida';
  };

  const getStatusBadge = (status) => {
    const config = {
      'Ativa': { class: 'bg-green-100 text-green-700', icon: CheckCircle },
      'Revogada': { class: 'bg-red-100 text-red-700', icon: XCircle },
      'Expirada': { class: 'bg-gray-100 text-gray-700', icon: Clock }
    };
    const c = config[status] || config['Ativa'];
    return (
      <Badge className={`${c.class} flex items-center gap-1`}>
        <c.icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const filteredProcuracoes = procuracoes.filter(p => {
    const outorgante = getMemberName(p.outorgante_id).toLowerCase();
    const procurador = getMemberName(p.procurador_id).toLowerCase();
    const matchesSearch = outorgante.includes(searchTerm.toLowerCase()) || 
                          procurador.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#212121' }}>Procurações</h1>
              <p style={{ color: '#757575' }}>Gerencie as procurações dos membros</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Procuração
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Ativa">Ativas</SelectItem>
                    <SelectItem value="Revogada">Revogadas</SelectItem>
                    <SelectItem value="Expirada">Expiradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Outorgante</TableHead>
                      <TableHead>Procurador</TableHead>
                      <TableHead>Assembleia</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcuracoes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {procuracoes.length === 0 
                            ? 'Nenhuma procuração cadastrada'
                            : 'Nenhuma procuração encontrada'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProcuracoes.map((proc) => (
                        <TableRow key={proc.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {getMemberName(proc.outorgante_id)}
                          </TableCell>
                          <TableCell>{getMemberName(proc.procurador_id)}</TableCell>
                          <TableCell>{getAssembleiaName(proc.assembleia_id)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {proc.data_inicio && format(new Date(proc.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                              {proc.data_fim && (
                                <> - {format(new Date(proc.data_fim), 'dd/MM/yyyy', { locale: ptBR })}</>
                              )}
                              {!proc.data_fim && ' - Indeterminado'}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(proc.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">•••</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingProcuracao(proc)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                {proc.status === 'Ativa' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusChange(proc, 'Revogada')}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Revogar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 text-sm text-gray-500">
            Mostrando {filteredProcuracoes.length} de {procuracoes.length} procurações
          </div>
        </main>
      </div>

      <ProcuracaoFormModal
        open={showAddModal || !!editingProcuracao}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingProcuracao(null);
          }
        }}
        procuracao={editingProcuracao}
        tenantId={tenant?.id}
        membros={membros}
        assembleias={assembleias}
        user={user}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingProcuracao(null);
          loadData();
        }}
      />
    </div>
  );
}