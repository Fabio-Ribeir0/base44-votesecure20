import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Search, 
  Upload,
  Edit,
  UserX,
  UserCheck,
  Filter,
  Loader2
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MemberFormModal from '@/components/membros/MemberFormModal';
import ImportCSVModal from '@/components/membros/ImportCSVModal';

export default function Membros() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [membros, setMembros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTipo, setFilterTipo] = useState('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

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
      await loadMembros(tenants[0].id);

    } catch (error) {
      console.error('Error loading:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembros = async (tenantId) => {
    try {
      const data = await base44.entities.Membro.filter({ tenant_id: tenantId });
      setMembros(data);
    } catch (error) {
      console.error('Error loading membros:', error);
      setMembros([]);
    }
  };

  const handleToggleStatus = async (membro) => {
    try {
      await base44.entities.Membro.update(membro.id, { ativo: !membro.ativo });
      toast.success(membro.ativo ? 'Membro desativado' : 'Membro ativado');
      loadMembros(tenant.id);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const filteredMembros = membros.filter(membro => {
    const matchesSearch = 
      membro.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membro.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membro.documento?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'ativo' && membro.ativo) || 
      (filterStatus === 'inativo' && !membro.ativo);
    
    const matchesTipo = filterTipo === 'all' || membro.tipo_membro === filterTipo;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#1976D2', borderTopColor: 'transparent' }}></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Membros</h1>
              <p className="text-gray-600">Gerencie os membros da sua organização</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowImportModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
              </Button>
              <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Membro
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ativo">Ativos</SelectItem>
                      <SelectItem value="inativo">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterTipo} onValueChange={setFilterTipo}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="Proprietário">Proprietário</SelectItem>
                      <SelectItem value="Inquilino">Inquilino</SelectItem>
                      <SelectItem value="Representante">Representante</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Table/List */}
          <Card>
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Peso do Voto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredMembros.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {membros.length === 0 
                              ? 'Nenhum membro cadastrado ainda'
                              : 'Nenhum membro encontrado com os filtros aplicados'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMembros.map((membro) => (
                          <motion.tr
                            key={membro.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b hover:bg-gray-50"
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">{membro.nome_completo}</p>
                                {membro.documento && (
                                  <p className="text-xs text-gray-500">{membro.documento}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {membro.email && <p>{membro.email}</p>}
                                {membro.telefone && <p className="text-gray-500">{membro.telefone}</p>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{membro.tipo_membro || 'Proprietário'}</Badge>
                            </TableCell>
                            <TableCell>{membro.peso_voto || 1}</TableCell>
                            <TableCell>
                              <Badge className={membro.ativo !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {membro.ativo !== false ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">•••</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setEditingMember(membro)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleStatus(membro)}>
                                    {membro.ativo !== false ? (
                                      <>
                                        <UserX className="w-4 h-4 mr-2" />
                                        Desativar
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Ativar
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {filteredMembros.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    {membros.length === 0 
                      ? 'Nenhum membro cadastrado ainda'
                      : 'Nenhum membro encontrado'}
                  </p>
                ) : (
                  filteredMembros.map((membro) => (
                    <Card key={membro.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{membro.nome_completo}</p>
                          <p className="text-sm text-gray-500">{membro.email || membro.telefone}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{membro.tipo_membro || 'Proprietário'}</Badge>
                            <Badge className={membro.ativo !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {membro.ativo !== false ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">•••</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingMember(membro)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(membro)}>
                              {membro.ativo !== false ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="mt-4 text-sm text-gray-500">
            Mostrando {filteredMembros.length} de {membros.length} membros
          </div>
        </main>
      </div>

      <MemberFormModal
        open={showAddModal || !!editingMember}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingMember(null);
          }
        }}
        member={editingMember}
        tenantId={tenant?.id}
        user={user}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingMember(null);
          loadMembros(tenant.id);
        }}
      />

      <ImportCSVModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        tenantId={tenant?.id}
        onSuccess={() => {
          setShowImportModal(false);
          loadMembros(tenant.id);
        }}
      />
    </div>
  );
}