import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { 
  CalendarDays, 
  Clock,
  MapPin,
  Users,
  Vote,
  QrCode,
  UserCheck,
  FileText,
  ArrowLeft,
  Play,
  Square,
  Send,
  Plus,
  CheckCircle,
  XCircle,
  MoreVertical,
  Pencil,
  Trash2,
  Lock,
  Scale,
  MinusCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import QRCode from 'react-qr-code';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import VotacaoFormModal from '@/components/votacao/VotacaoFormModal';
import VotarModal from '@/components/votacao/VotarModal';
import VotacaoResultados from '@/components/votacao/VotacaoResultados';
import { AuditLogger } from '@/components/audit/AuditLogger';

export default function AssembleiaDetalhes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [assembleia, setAssembleia] = useState(null);
  const [membros, setMembros] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [votacoes, setVotacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedMembros, setSelectedMembros] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVotacaoModal, setShowVotacaoModal] = useState(false);
  const [editingVotacao, setEditingVotacao] = useState(null);
  const [votandoEm, setVotandoEm] = useState(null);
  const [myMembro, setMyMembro] = useState(null);
  const [votacaoToDelete, setVotacaoToDelete] = useState(null);

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 10 seconds to show updated checkins
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    
    return () => clearInterval(interval);
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

      // Get assembleia ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const assembleiaId = urlParams.get('id');
      
      if (!assembleiaId) {
        navigate(createPageUrl('Assembleias'));
        return;
      }

      // Load assembleia
      const assembleias = await base44.entities.Assembleia.filter({ id: assembleiaId });
      if (assembleias.length === 0) {
        toast.error('Assembleia não encontrada');
        navigate(createPageUrl('Assembleias'));
        return;
      }
      setAssembleia(assembleias[0]);

      // Load membros
      const membrosData = await base44.entities.Membro.filter({ tenant_id: tenants[0].id, ativo: true });
      setMembros(membrosData);

      // Find current user's membro record
      const userMembro = membrosData.find(m => 
        m.email === userData.email || 
        m.nome_completo?.toLowerCase() === userData.full_name?.toLowerCase()
      );
      setMyMembro(userMembro);

      // Load checkins
      const checkinsData = await base44.entities.CheckIn.filter({ assembleia_id: assembleiaId });
      setCheckins(checkinsData);

      // Load votacoes
      try {
        const votacoesData = await base44.entities.Votacao.filter({ assembleia_id: assembleiaId });
        setVotacoes(votacoesData);
      } catch (e) {
        setVotacoes([]);
      }

    } catch (error) {
      console.error('Error loading:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await base44.entities.Assembleia.update(assembleia.id, { status: newStatus });
      setAssembleia({ ...assembleia, status: newStatus });
      toast.success(`Assembleia ${newStatus === 'Em andamento' ? 'iniciada' : 'encerrada'}`);
      
      // Log audit
      AuditLogger.logUpdate('Assembleia', assembleia.id, 
        `Assembleia "${assembleia.nome}" ${newStatus === 'Em andamento' ? 'iniciada' : 'encerrada'}`,
        tenant.id, user
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleManualCheckin = async () => {
    if (selectedMembros.length === 0) return;

    try {
      let successCount = 0;
      let alreadyCheckedCount = 0;
      const checkedInMembers = [];

      for (const membroId of selectedMembros) {
        // Check if already checked in
        const existing = checkins.find(c => c.membro_id === membroId);
        if (existing) {
          alreadyCheckedCount++;
          continue;
        }

        await base44.entities.CheckIn.create({
          assembleia_id: assembleia.id,
          membro_id: membroId,
          data_hora: new Date().toISOString(),
          metodo: 'Manual',
          realizado_por: user.id
        });

        // Log audit
        const membroSelecionado = membros.find(m => m.id === membroId);
        AuditLogger.logCheckin(assembleia.id, 
          `Check-in manual de "${membroSelecionado?.nome_completo}" na assembleia "${assembleia.nome}"`,
          tenant.id, user
        );

        checkedInMembers.push(membroSelecionado);
        successCount++;
      }

      // Send webhook notification for checked-in members
      if (checkedInMembers.length > 0) {
        try {
          const baseUrl = window.location.origin;
          const magicLink = `${baseUrl}/VotacaoMembro?assembleia_id=${assembleia.id}`;

          await base44.functions.invoke('enviarWebhookN8N', {
            event: 'checkin_confirmed_batch',
            tenant_id: tenant.id,
            organization_name: tenant.nome || '',
            assembly_id: assembleia.id,
            assembly_name: assembleia.nome,
            members: checkedInMembers.map(m => ({ ...m, url: magicLink }))
          });
        } catch (webhookError) {
          console.error('Erro ao enviar webhook de check-in:', webhookError);
          // Não bloqueia o check-in
        }
      }

      if (successCount > 0) {
        toast.success(`Check-in de ${successCount} membro${successCount > 1 ? 's' : ''} realizado com sucesso!`);
      }
      if (alreadyCheckedCount > 0) {
        toast.info(`${alreadyCheckedCount} membro${alreadyCheckedCount > 1 ? 's já estavam' : ' já estava'} com check-in`);
      }

      setShowCheckinModal(false);
      setSelectedMembros([]);
      setSearchQuery('');
      loadData();
    } catch (error) {
      console.error('Error creating checkin:', error);
      toast.error('Erro ao realizar check-in');
    }
  };

  const toggleMembroSelection = (membroId) => {
    setSelectedMembros(prev => 
      prev.includes(membroId) 
        ? prev.filter(id => id !== membroId)
        : [...prev, membroId]
    );
  };

  const getFilteredMembrosForCheckin = () => {
    return membros
      .filter(m => !getMemberCheckinStatus(m.id))
      .filter(m => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
          m.nome_completo?.toLowerCase().includes(search) ||
          m.email?.toLowerCase().includes(search)
        );
      });
  };

  const getCheckinUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/Checkin?token=${assembleia?.qr_code_checkin_token}`;
  };

  const getMemberCheckinStatus = (membroId) => {
    return checkins.some(c => c.membro_id === membroId);
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

  const handleVotacaoStatusChange = async (votacao, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'Aberta') {
        updateData.data_abertura = new Date().toISOString();
      } else if (newStatus === 'Encerrada') {
        updateData.data_encerramento = new Date().toISOString();
      }
      await base44.entities.Votacao.update(votacao.id, updateData);
      toast.success(`Votação ${newStatus === 'Aberta' ? 'aberta' : 'encerrada'}!`);
      
      // Log audit
      AuditLogger.logUpdate('Votacao', votacao.id,
        `Votação "${votacao.titulo}" ${newStatus === 'Aberta' ? 'aberta' : 'encerrada'}`,
        tenant.id, user
      );
      
      loadData();
    } catch (error) {
      console.error('Error updating votacao:', error);
      toast.error('Erro ao atualizar votação');
    }
  };

  const handleDeleteVotacao = async () => {
    if (!votacaoToDelete) return;
    
    try {
      await base44.entities.Votacao.delete(votacaoToDelete.id);
      toast.success('Votação excluída!');
      
      // Log audit
      AuditLogger.logDelete('Votacao', votacaoToDelete.id,
        `Votação "${votacaoToDelete.titulo}" excluída`,
        tenant.id, user
      );
      
      setVotacaoToDelete(null);
      loadData();
    } catch (error) {
      console.error('Error deleting votacao:', error);
      toast.error('Erro ao excluir votação');
    }
  };

  const canOpenVotacao = (votacao) => {
    // Se a votação tem quórum próprio, verifica se o quórum atual atende
    if (votacao.quorum_minimo && votacao.quorum_minimo > 0) {
      return quorumPercentage >= votacao.quorum_minimo;
    }
    // Se não tem quórum próprio, verifica o quórum da assembleia
    return quorumPercentage >= (assembleia?.quorum_minimo || 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!assembleia) return null;

  const presentCount = checkins.length;
  const quorumPercentage = membros.length > 0 ? Math.round((presentCount / membros.length) * 100) : 0;

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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <button 
                onClick={() => navigate(createPageUrl('Assembleias'))}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{assembleia.nome}</h1>
                {getStatusBadge(assembleia.status)}
              </div>
            </div>
            <div className="flex gap-2">
              {assembleia.status === 'Agendada' && (
                <Button onClick={() => handleStatusChange('Em andamento')} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar
                </Button>
              )}
              {assembleia.status === 'Em andamento' && (
                <Button onClick={() => handleStatusChange('Encerrada')} variant="outline">
                  <Square className="w-4 h-4 mr-2" />
                  Encerrar
                </Button>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Data/Hora</p>
                    <p className="font-medium">
                      {format(new Date(assembleia.data_hora_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Presentes</p>
                    <p className="font-medium">{presentCount} de {membros.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Vote className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Quórum</p>
                    <p className="font-medium">{quorumPercentage}% (mín: {assembleia.quorum_minimo}%)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Votações</p>
                    <p className="font-medium">{votacoes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="checkin" className="space-y-4">
            <TabsList>
              <TabsTrigger value="checkin">Check-in</TabsTrigger>
              <TabsTrigger value="votacoes">Votações</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>

            <TabsContent value="checkin">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Lista de Presença</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowQRModal(true)}>
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                    <Button onClick={() => setShowCheckinModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Check-in Manual
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Membro</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Método</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {membros.map(membro => {
                        const checkin = checkins.find(c => c.membro_id === membro.id);
                        return (
                          <TableRow key={membro.id}>
                            <TableCell className="font-medium">{membro.nome_completo}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{membro.tipo_membro || 'Proprietário'}</Badge>
                            </TableCell>
                            <TableCell>
                              {checkin ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Presente
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Ausente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {checkin ? format(new Date(checkin.data_hora), "HH:mm", { locale: ptBR }) : '-'}
                            </TableCell>
                            <TableCell>{checkin?.metodo || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="votacoes">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Votações</CardTitle>
                  {['Agendada', 'Em andamento'].includes(assembleia.status) && (
                    <Button onClick={() => setShowVotacaoModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Votação
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {votacoes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Vote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma votação criada para esta assembleia</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {votacoes.map(votacao => (
                        <Card key={votacao.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{votacao.titulo}</h4>
                                  <Badge className={
                                    votacao.status === 'Aberta' ? 'bg-green-100 text-green-700' :
                                    votacao.status === 'Encerrada' ? 'bg-gray-100 text-gray-700' :
                                    'bg-blue-100 text-blue-700'
                                  }>
                                    {votacao.status}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {votacao.tipo_voto}
                                  </Badge>
                                  
                                  {votacao.voto_secreto && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Lock className="w-3 h-3" />
                                      Voto Secreto
                                    </Badge>
                                  )}
                                  
                                  {votacao.voto_qualificado && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Scale className="w-3 h-3" />
                                      Voto Qualificado
                                    </Badge>
                                  )}
                                  
                                  {votacao.permite_abstencao && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <MinusCircle className="w-3 h-3" />
                                      Permite Abstenção
                                    </Badge>
                                  )}
                                  
                                  {votacao.quorum_minimo && votacao.quorum_minimo > 0 && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      Quórum: {quorumPercentage}%/{votacao.quorum_minimo}%
                                    </Badge>
                                  )}
                                </div>

                                {votacao.descricao && (
                                  <p className="text-sm text-gray-600 mt-2">{votacao.descricao}</p>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                {votacao.status === 'Aberta' && myMembro && (
                                  <Button 
                                    onClick={() => setVotandoEm(votacao)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Vote className="w-4 h-4 mr-2" />
                                    Votar
                                  </Button>
                                )}
                                {votacao.status === 'Pendente' && (
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleVotacaoStatusChange(votacao, 'Aberta')}
                                    disabled={!canOpenVotacao(votacao)}
                                    title={!canOpenVotacao(votacao) ? 'Quórum mínimo não atingido' : ''}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Abrir
                                  </Button>
                                )}
                                {votacao.status === 'Aberta' && (
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleVotacaoStatusChange(votacao, 'Encerrada')}
                                  >
                                    <Square className="w-4 h-4 mr-2" />
                                    Encerrar
                                  </Button>
                                )}
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={() => setEditingVotacao(votacao)}
                                      disabled={votacao.status !== 'Pendente'}
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => setVotacaoToDelete(votacao)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Show results for closed votacoes */}
              {votacoes.filter(v => v.status === 'Encerrada').length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Resultados</h3>
                  {votacoes.filter(v => v.status === 'Encerrada').map(votacao => (
                    <VotacaoResultados key={votacao.id} votacao={votacao} membros={membros} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="detalhes">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Assembleia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assembleia.local && (
                    <div>
                      <p className="text-sm text-gray-500">Local</p>
                      <p className="font-medium">{assembleia.local}</p>
                    </div>
                  )}
                  {assembleia.descricao && (
                    <div>
                      <p className="text-sm text-gray-500">Descrição</p>
                      <p>{assembleia.descricao}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Quórum Mínimo</p>
                      <p className="font-medium">{assembleia.quorum_minimo}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Referendação</p>
                      <p className="font-medium">{assembleia.tipo_referendacao}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="modal-smooth-fade sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code para Check-in</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center p-4">
            <div className="bg-white p-4 rounded-xl">
              <QRCode value={getCheckinUrl()} size={200} />
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Escaneie este QR Code para fazer check-in na assembleia
            </p>
            <div className="mt-2 p-3 bg-gray-100 rounded-lg w-full">
              <p className="text-xs text-gray-600 break-all text-center font-mono">
                {getCheckinUrl()}
              </p>
            </div>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={() => {
                navigator.clipboard.writeText(getCheckinUrl());
                toast.success('Link copiado!');
              }}
            >
              Copiar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Checkin Modal */}
      <Dialog open={showCheckinModal} onOpenChange={(open) => {
        setShowCheckinModal(open);
        if (!open) {
          setSelectedMembros([]);
          setSearchQuery('');
        }
      }}>
        <DialogContent className="modal-smooth-fade sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check-in Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar membro</label>
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selecione os membros ({getFilteredMembrosForCheckin().length} disponíveis)
              </label>
              <div className="border rounded-lg max-h-[280px] overflow-y-auto">
                {getFilteredMembrosForCheckin().length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Nenhum membro disponível para check-in
                  </div>
                ) : (
                  <div className="divide-y">
                    {getFilteredMembrosForCheckin().map(membro => (
                      <label
                        key={membro.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembros.includes(membro.id)}
                          onChange={() => toggleMembroSelection(membro.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {membro.nome_completo}
                          </p>
                          {membro.email && (
                            <p className="text-xs text-gray-500 truncate">{membro.email}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCheckinModal(false);
                  setSelectedMembros([]);
                  setSearchQuery('');
                }} 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleManualCheckin} 
                disabled={selectedMembros.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Check-in de {selectedMembros.length} membro{selectedMembros.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Votacao Form Modal */}
      <VotacaoFormModal
        open={showVotacaoModal || !!editingVotacao}
        onOpenChange={(open) => {
          if (!open) {
            setShowVotacaoModal(false);
            setEditingVotacao(null);
          }
        }}
        votacao={editingVotacao}
        assembleiaId={assembleia?.id}
        userId={user?.id}
        tenantId={tenant?.id}
        user={user}
        onSuccess={() => {
          setShowVotacaoModal(false);
          setEditingVotacao(null);
          loadData();
        }}
      />

      {/* Votar Modal */}
      <VotarModal
        open={!!votandoEm}
        onOpenChange={(open) => { if (!open) setVotandoEm(null); }}
        votacao={votandoEm}
        membroId={myMembro?.id}
        pesoVoto={myMembro?.peso_voto || 1}
        tenantId={tenant?.id}
        user={user}
        onSuccess={() => {
          setVotandoEm(null);
          loadData();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!votacaoToDelete} onOpenChange={(open) => { if (!open) setVotacaoToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a votação "{votacaoToDelete?.titulo}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVotacao} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}