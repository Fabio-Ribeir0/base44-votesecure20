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

      // Load stats (in a real app, these would be actual queries)
      // For now, setting placeholder data
      setStats({
        membros: 0,
        assembleias: 0,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
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

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-yellow-800 flex-1">{trialAlert.message}</p>
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  Fazer Upgrade
                </Button>
              </div>
            </motion.div>
          )}

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Bem-vindo, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
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
                  className={`hover:shadow-lg transition-all duration-300 ${stat.page ? 'cursor-pointer hover:-translate-y-1' : ''}`}
                  onClick={() => stat.page && navigate(createPageUrl(stat.page))}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[stat.color]}`}>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate(createPageUrl('Assembleias'))}
                  className="w-full justify-between bg-blue-600 hover:bg-blue-700"
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
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Adicionar Membro
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status do Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Plano Atual</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      {tenant?.plano_ativo ? 'Ativo' : 'Básico'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge className={tenant?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {tenant?.status === 'active' ? 'Ativo' : 'Em teste'}
                    </Badge>
                  </div>
                  {tenant?.status === 'trialing' && tenant?.data_fim_trial && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Termina em</span>
                      <span className="font-medium">
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
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Comece a usar o VoteSecure
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Cadastre os membros da sua organização e crie sua primeira assembleia para começar a realizar votações digitais.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => navigate(createPageUrl('Membros'))}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Cadastrar Membros
                    </Button>
                    <Button 
                      onClick={() => navigate(createPageUrl('Assembleias'))}
                      variant="outline"
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