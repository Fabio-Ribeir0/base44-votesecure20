import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Eye,
  Edit,
  XCircle,
  Play,
  Square,
  Filter,
  Clock,
  MapPin,
  Users
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AssembleiaFormModal from '@/components/assembleias/AssembleiaFormModal';

export default function Assembleias() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [assembleias, setAssembleias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssembleia, setEditingAssembleia] = useState(null);

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
      await loadAssembleias(tenants[0].id);

    } catch (error) {
      console.error('Error loading:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssembleias = async (tenantId) => {
    try {
      const data = await base44.entities.Assembleia.filter({ tenant_id: tenantId });
      setAssembleias(data.sort((a, b) => new Date(b.data_hora_inicio) - new Date(a.data_hora_inicio)));
    } catch (error) {
      console.error('Error loading assembleias:', error);
      setAssembleias([]);
    }
  };

  const handleStatusChange = async (assembleia, newStatus) => {
    try {
      await base44.entities.Assembleia.update(assembleia.id, { status: newStatus });
      toast.success(`Assembleia ${newStatus === 'Em andamento' ? 'iniciada' : newStatus === 'Encerrada' ? 'encerrada' : 'atualizada'}`);
      loadAssembleias(tenant.id);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'Agendada': 'bg-blue-100 text-blue-700',
      'Em andamento': 'bg-green-100 text-green-700',
      'Encerrada': 'bg-gray-100 text-gray-700',
      'Cancelada': 'bg-red-100 text-red-700'
    };
    return <Badge className={config[status] || config['Agendada']}>{status}</Badge>;
  };

  const filteredAssembleias = assembleias.filter(assembleia => {
    const matchesSearch = assembleia.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assembleia.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-2xl font-bold text-gray-900">Assembleias</h1>
              <p className="text-gray-600">Gerencie as assembleias da sua organização</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Assembleia
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
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="Agendada">Agendada</SelectItem>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Encerrada">Encerrada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Assembleias List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAssembleias.length === 0 ? (
                <Card className="p-8 text-center">
                  <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {assembleias.length === 0 
                      ? 'Nenhuma assembleia cadastrada ainda'
                      : 'Nenhuma assembleia encontrada com os filtros aplicados'}
                  </p>
                </Card>
              ) : (
                filteredAssembleias.map((assembleia) => (
                  <motion.div
                    key={assembleia.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{assembleia.nome}</h3>
                              {getStatusBadge(assembleia.status)}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {format(new Date(assembleia.data_hora_inicio), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                              </div>
                              {assembleia.local && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {assembleia.local}
                                </div>
                              )}
                            </div>
                            {assembleia.descricao && (
                              <p className="text-gray-600 mt-2 text-sm line-clamp-2">{assembleia.descricao}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => navigate(createPageUrl('AssembleiaDetalhes') + `?id=${assembleia.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detalhes
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline">•••</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {assembleia.status === 'Agendada' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(assembleia, 'Em andamento')}>
                                      <Play className="w-4 h-4 mr-2" />
                                      Iniciar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setEditingAssembleia(assembleia)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusChange(assembleia, 'Cancelada')}
                                      className="text-red-600"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Cancelar
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {assembleia.status === 'Em andamento' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(assembleia, 'Encerrada')}>
                                    <Square className="w-4 h-4 mr-2" />
                                    Encerrar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Mostrando {filteredAssembleias.length} de {assembleias.length} assembleias
          </div>
        </main>
      </div>

      <AssembleiaFormModal
        open={showAddModal || !!editingAssembleia}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingAssembleia(null);
          }
        }}
        assembleia={editingAssembleia}
        tenantId={tenant?.id}
        userId={user?.id}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingAssembleia(null);
          loadAssembleias(tenant.id);
        }}
      />
    </div>
  );
}