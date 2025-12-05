import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Users, 
  CalendarDays, 
  Vote, 
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    membros: 0,
    assembleias: 0,
    votacoes: 0,
    votos: 0
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

      // Load actual stats
      const [membrosData, assembleiasData] = await Promise.all([
        base44.entities.Membro.filter({ tenant_id: tenants[0].id, ativo: true }),
        base44.entities.Assembleia.filter({ tenant_id: tenants[0].id })
      ]);

      const agendadas = assembleiasData.filter(a => ['Agendada', 'Em andamento'].includes(a.status));
      
      setStats({
        membros: membrosData.length,
        assembleias: agendadas.length,
        votacoes: 0,
        votos: 0
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrialAlert = () => {
    if (tenant?.status !== 'trialing' || !tenant?.data_fim_trial) return null;
    const endDate = new Date(tenant.data_fim_trial);
    const now = new Date();
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 3) {
      return {
        type: 'warning',
        message: `Seu período de teste termina em ${daysLeft} dias. Faça upgrade para continuar usando.`
      };
    }
    return null;
  };

  const trialAlert = getTrialAlert();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#1976D2', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Membros Ativos', 
      value: stats.membros, 
      icon: Users, 
      color: 'blue',
      page: 'Membros'
    },
    { 
      title: 'Assembleias Agendadas', 
      value: stats.assembleias, 
      icon: CalendarDays, 
      color: 'green',
      page: 'Assembleias'
    },
    { 
      title: 'Votações em Andamento', 
      value: stats.votacoes, 
      icon: Vote, 
      color: 'purple',
      page: 'Assembleias'
    },
    { 
      title: 'Votos (últimos 30 dias)', 
      value: stats.votos, 
      icon: CheckCircle2, 
      color: 'orange',
      page: null
    }
  ];

  const colorStyles = {
    blue: { backgroundColor: '#BBDEFB', color: '#1976D2' },
    green: { backgroundColor: '#E8F5E9', color: '#4CAF50' },
    purple: { backgroundColor: '#E1BEE7', color: '#7B1FA2' },
    orange: { backgroundColor: '#FFF3E0', color: '#E65100' }
  };

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
          {/* Trial Alert */}
          {trialAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div 
                className="rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                style={{ 
                  backgroundColor: '#FFF3E0', 
                  border: '1px solid #FFB74D',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
                }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#E65100' }} />
                <p className="flex-1" style={{ color: '#E65100' }}>{trialAlert.message}</p>
                <Button 
                  size="sm" 
                  className="w-full sm:w-auto text-white min-h-[44px]"
                  style={{ backgroundColor: '#E65100' }}
                  onClick={() => navigate(createPageUrl('MinhaOrganizacao'))}
                >
                  Fazer Upgrade
                </Button>
              </div>
            </motion.div>
          )}

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: '#212121' }}>
              Bem-vindo, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="mt-1" style={{ color: '#757575' }}>
              Aqui está um resumo da sua organização
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`transition-all duration-300 ${stat.page ? 'cursor-pointer' : ''}`}
                    style={{ 
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                      borderRadius: '8px',
                      border: 'none'
                    }}
                    onClick={() => stat.page && navigate(createPageUrl(stat.page))}
                    onMouseEnter={(e) => {
                      if (stat.page) {
                        e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm mb-1" style={{ color: '#757575' }}>{stat.title}</p>
                          <p className="text-3xl font-bold" style={{ color: '#212121' }}>{stat.value}</p>
                        </div>
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={colorStyles[stat.color]}
                        >
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              style={{ 
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                borderRadius: '8px',
                border: 'none'
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#212121' }}>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate(createPageUrl('Assembleias'))}
                  className="w-full justify-between text-white min-h-[44px] transition-all duration-200"
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
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Criar Nova Assembleia
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => navigate(createPageUrl('Membros'))}
                  variant="outline"
                  className="w-full justify-between min-h-[44px] transition-all duration-200"
                  style={{ 
                    borderColor: '#1976D2',
                    color: '#1976D2',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#BBDEFB';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Adicionar Membro
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              style={{ 
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                borderRadius: '8px',
                border: 'none'
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#212121' }}>Status do Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#757575' }}>Plano Atual</span>
                    <Badge style={{ backgroundColor: '#BBDEFB', color: '#1976D2' }}>
                      {tenant?.plano_ativo ? 'Ativo' : 'Básico'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#757575' }}>Status</span>
                    <Badge style={tenant?.status === 'active' 
                      ? { backgroundColor: '#E8F5E9', color: '#4CAF50' } 
                      : { backgroundColor: '#FFF3E0', color: '#E65100' }
                    }>
                      {tenant?.status === 'active' ? 'Ativo' : 'Em teste'}
                    </Badge>
                  </div>
                  {tenant?.status === 'trialing' && tenant?.data_fim_trial && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: '#757575' }}>Termina em</span>
                      <span className="font-medium" style={{ color: '#212121' }}>
                        {new Date(tenant.data_fim_trial).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Empty State for New Users */}
          {stats.membros === 0 && stats.assembleias === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card 
                style={{ 
                  background: 'linear-gradient(135deg, #BBDEFB 0%, #FFFFFF 100%)',
                  border: '1px solid #90CAF9',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
                }}
              >
                <CardContent className="p-8 text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#BBDEFB' }}
                  >
                    <TrendingUp className="w-8 h-8" style={{ color: '#1976D2' }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#212121' }}>
                    Comece a usar o VoteSecure
                  </h3>
                  <p className="mb-6 max-w-md mx-auto" style={{ color: '#757575' }}>
                    Cadastre os membros da sua organização e crie sua primeira assembleia para começar a realizar votações digitais.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => navigate(createPageUrl('Membros'))}
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
                      <Users className="w-4 h-4 mr-2" />
                      Cadastrar Membros
                    </Button>
                    <Button 
                      onClick={() => navigate(createPageUrl('Assembleias'))}
                      variant="outline"
                      className="min-h-[44px] transition-all duration-200"
                      style={{ 
                        borderColor: '#1976D2',
                        color: '#1976D2',
                        borderRadius: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#BBDEFB';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Criar Assembleia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}