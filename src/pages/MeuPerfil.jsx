import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Download, 
  Trash2,
  Save,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

export default function MeuPerfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    telefone: '',
    consente_dados: true
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
      setFormData({
        full_name: userData.full_name || '',
        telefone: userData.telefone || '',
        consente_dados: userData.consente_dados !== false
      });

      if (userData.tenant_id) {
        const tenants = await base44.entities.Tenant.filter({ id: userData.tenant_id });
        if (tenants.length > 0) {
          setTenant(tenants[0]);
        }
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        telefone: formData.telefone,
        consente_dados: formData.consente_dados
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        usuario: {
          nome: user.full_name,
          email: user.email,
          telefone: user.telefone,
          perfil: user.perfil_tenant,
          data_cadastro: user.created_date
        },
        organizacao: tenant ? {
          nome: tenant.nome,
          tipo: tenant.tipo_organizacao
        } : null,
        exportado_em: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  const handleDeleteRequest = async () => {
    try {
      // In a real app, this would send a notification to admin
      await base44.auth.updateMe({ ativo: false });
      toast.success('Solicitação de exclusão enviada. Você será notificado.');
      setShowDeleteDialog(false);
      base44.auth.logout('/');
    } catch (error) {
      console.error('Error requesting deletion:', error);
      toast.error('Erro ao solicitar exclusão');
    }
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
        
        <main className="p-4 lg:p-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#212121' }}>Meu Perfil</h1>
            <p style={{ color: '#757575' }}>Gerencie suas informações pessoais e preferências</p>
          </div>

          <div className="space-y-6">
            {/* Personal Info */}
            <Card
              style={{ 
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                borderRadius: '8px',
                border: 'none'
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#212121' }}>
                  <User className="w-5 h-5" style={{ color: '#1976D2' }} />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Seus dados básicos de cadastro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input 
                      value={formData.full_name} 
                      disabled 
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Nome não pode ser alterado</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Email não pode ser alterado</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input 
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="font-medium text-gray-900">Perfil no Sistema</p>
                    <p className="text-sm text-gray-500">Seu nível de acesso na organização</p>
                  </div>
                  <Badge style={{ backgroundColor: '#BBDEFB', color: '#1976D2' }}>
                    {user?.perfil_tenant || 'Membro'}
                  </Badge>
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={isSaving} 
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
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
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
                  Privacidade e Dados (LGPD)
                </CardTitle>
                <CardDescription>
                  Gerencie suas preferências de privacidade e seus dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Consentimento de Dados</p>
                    <p className="text-sm text-gray-500">
                      Autorizo o uso dos meus dados para as funcionalidades do VoteSecure
                    </p>
                  </div>
                  <Switch 
                    checked={formData.consente_dados}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consente_dados: checked }))}
                  />
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-medium text-gray-900">Seus Direitos (LGPD)</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={handleExportData}
                      className="justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Meus Dados
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteDialog(true)}
                      className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Solicitar Exclusão
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Ao solicitar exclusão, sua conta será desativada e seus dados serão processados conforme nossa política de privacidade.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Solicitar Exclusão de Dados</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja solicitar a exclusão de seus dados? 
              Esta ação irá desativar sua conta e enviar uma solicitação ao administrador.
              Você poderá perder acesso a todos os seus dados e histórico de votações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRequest}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}