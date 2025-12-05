import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { 
  Building2, 
  CreditCard, 
  Calendar,
  Edit,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { AuditLogger } from '@/components/audit/AuditLogger';

const TIPOS_ORGANIZACAO = [
  'Condomínio',
  'Igreja',
  'Empresa',
  'Associação',
  'Outro'
];

export default function MinhaOrganizacao() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo_organizacao: '',
    cnpj_cpf: '',
    telefone: '',
    endereco: ''
  });

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

      if (!['Administrador', 'Presidente'].includes(userData.perfil_tenant)) {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      if (!userData.tenant_id) {
        navigate('/');
        return;
      }

      const tenants = await base44.entities.Tenant.filter({ id: userData.tenant_id });
      if (tenants.length === 0) {
        navigate('/');
        return;
      }

      setTenant(tenants[0]);
      setFormData({
        nome: tenants[0].nome || '',
        tipo_organizacao: tenants[0].tipo_organizacao || '',
        cnpj_cpf: tenants[0].cnpj_cpf || '',
        telefone: tenants[0].telefone || '',
        endereco: tenants[0].endereco || ''
      });

    } catch (error) {
      console.error('Error loading organization:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.entities.Tenant.update(tenant.id, formData);
      setTenant({ ...tenant, ...formData });
      setIsEditing(false);
      toast.success('Organização atualizada com sucesso!');
      
      // Log audit
      AuditLogger.logUpdate('Tenant', tenant.id, 
        `Dados da organização "${formData.nome}" atualizados`,
        tenant.id, user
      );
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error('Erro ao salvar organização');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await base44.entities.Tenant.update(tenant.id, { 
        status: tenant.status === 'trialing' ? 'trial_canceled' : 'canceled' 
      });
      toast.success('Assinatura cancelada com sucesso');
      setShowCancelDialog(false);
      loadData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Erro ao cancelar assinatura');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      trialing: { label: 'Em teste', class: 'bg-yellow-100 text-yellow-700', icon: Calendar },
      active: { label: 'Ativo', class: 'bg-green-100 text-green-700', icon: CheckCircle },
      canceled: { label: 'Cancelado', class: 'bg-red-100 text-red-700', icon: XCircle },
      trial_canceled: { label: 'Trial cancelado', class: 'bg-red-100 text-red-700', icon: XCircle },
      past_due: { label: 'Pagamento pendente', class: 'bg-orange-100 text-orange-700', icon: AlertCircle }
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge className={`${config.class} flex items-center gap-1`}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTrialInfo = () => {
    if (tenant?.status !== 'trialing' || !tenant?.data_fim_trial) return null;
    const endDate = new Date(tenant.data_fim_trial);
    const now = new Date();
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    return {
      daysLeft: Math.max(0, daysLeft),
      endDate: endDate.toLocaleDateString('pt-BR')
    };
  };

  const trialInfo = getTrialInfo();

  const PLANS = [
    { name: 'Básico', price: 49.90, features: ['50 membros', '2 assembleias/mês'] },
    { name: 'Padrão', price: 99.90, features: ['200 membros', '5 assembleias/mês', 'WhatsApp'] },
    { name: 'Avançado', price: 199.90, features: ['500 membros', '15 assembleias/mês', 'Voto qualificado'] },
    { name: 'Empresarial', price: 399.90, features: ['Ilimitado', 'Todos os recursos'] }
  ];

  const handleUpgrade = async (planName) => {
    setIsProcessingPayment(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        planName,
        tenantId: tenant.id
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Erro ao iniciar pagamento');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOpenPortal = async () => {
    try {
      const response = await base44.functions.invoke('createCustomerPortal', {
        tenantId: tenant.id
      });
      
      if (response.data?.url) {
        window.open(response.data.url, '_blank');
      } else {
        toast.error('Erro ao abrir portal');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('Erro ao abrir portal de pagamento');
    }
  };

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
        
        <main className="p-4 lg:p-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Minha Organização</h1>
            <p className="text-gray-600">Gerencie os dados da sua organização e plano</p>
          </div>

          <div className="space-y-6">
            {/* Organization Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Dados da Organização
                  </CardTitle>
                  <CardDescription>
                    Informações básicas da sua organização
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Organização</Label>
                    <Input 
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Organização</Label>
                    {isEditing ? (
                      <Select
                        value={formData.tipo_organizacao}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_organizacao: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_ORGANIZACAO.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        value={formData.tipo_organizacao}
                        disabled
                        className="bg-gray-50"
                      />
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CNPJ/CPF</Label>
                    <Input 
                      value={formData.cnpj_cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cnpj_cpf: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input 
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Endereço Completo</Label>
                  <Input 
                    value={formData.endereco}
                    onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          nome: tenant.nome || '',
                          tipo_organizacao: tenant.tipo_organizacao || '',
                          cnpj_cpf: tenant.cnpj_cpf || '',
                          telefone: tenant.telefone || '',
                          endereco: tenant.endereco || ''
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Plano e Assinatura
                </CardTitle>
                <CardDescription>
                  Detalhes do seu plano atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Status da Assinatura</p>
                      <div className="mt-1">
                        {getStatusBadge(tenant?.status)}
                      </div>
                    </div>

                    {trialInfo && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="font-medium text-yellow-800">
                          Período de teste
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Restam <span className="font-bold">{trialInfo.daysLeft} dias</span> de teste.
                          Termina em {trialInfo.endDate}.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Plano Atual</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {tenant?.plano_ativo ? 'Plano Ativo' : 'Básico'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Data de Criação</p>
                      <p className="font-medium">
                        {tenant?.created_date ? new Date(tenant.created_date).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 flex flex-wrap gap-3">
                  {tenant?.status === 'trialing' && (
                    <Button 
                      onClick={() => setShowUpgradeModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Ativar Plano Agora
                    </Button>
                  )}
                  {tenant?.stripe_customer_id && (
                    <Button variant="outline" onClick={handleOpenPortal}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Gerenciar Assinatura
                    </Button>
                  )}
                  {['trialing', 'active'].includes(tenant?.status) && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCancelDialog(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Cancelar Assinatura
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar sua assinatura? 
              {tenant?.status === 'trialing' 
                ? ' Você perderá acesso imediatamente após o cancelamento.'
                : ' Você terá acesso até o final do período atual.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Escolha seu Plano</DialogTitle>
            <DialogDescription>
              Ative agora e continue usando todos os recursos após o trial
            </DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4 py-4">
            {PLANS.map((plan) => (
              <div 
                key={plan.name}
                className="border rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                onClick={() => !isProcessingPayment && handleUpgrade(plan.name)}
              >
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-blue-600 my-2">
                  R${plan.price.toFixed(2).replace('.', ',')}
                  <span className="text-sm font-normal text-gray-500">/mês</span>
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Selecionar'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}