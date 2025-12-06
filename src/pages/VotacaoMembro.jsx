import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Shield, Vote, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import VotarModal from '@/components/votacao/VotarModal';

export default function VotacaoMembro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [assembleia, setAssembleia] = useState(null);
  const [membro, setMembro] = useState(null);
  const [votacoesAbertas, setVotacoesAbertas] = useState([]);
  const [votacaoSelecionada, setVotacaoSelecionada] = useState(null);
  const [mostrarVotarModal, setMostrarVotarModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 5 seconds to show new/closed votações
    const interval = setInterval(() => {
      if (assembleia) {
        loadVotacoesAbertas(assembleia.id);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [assembleia]);

  const loadData = async () => {
    try {
      const assembleiaId = searchParams.get('assembleiaId');
      
      if (!assembleiaId) {
        setError('ID da assembleia não fornecido');
        setIsLoading(false);
        return;
      }

      // Check authentication
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }

      const userData = await base44.auth.me();
      setUser(userData);

      // Load assembleia
      const assembleiaData = await base44.entities.Assembleia.get(assembleiaId);
      if (!assembleiaData) {
        setError('Assembleia não encontrada');
        setIsLoading(false);
        return;
      }
      setAssembleia(assembleiaData);

      // Validate member
      const membrosEncontrados = await base44.entities.Membro.filter({ 
        tenant_id: assembleiaData.tenant_id,
        email: userData.Email
      });
      
      const membroData = membrosEncontrados[0];
      if (!membroData) {
        setError('Você não é membro desta organização');
        setIsLoading(false);
        return;
      }

      if (!membroData.ativo) {
        setError('Seu cadastro de membro está inativo');
        setIsLoading(false);
        return;
      }

      setMembro(membroData);

      // Load open votações
      await loadVotacoesAbertas(assembleiaId);

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erro ao carregar dados da assembleia');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVotacoesAbertas = async (assembleiaId) => {
    try {
      const votacoes = await base44.entities.Votacao.filter({ 
        assembleia_id: assembleiaId,
        status: 'Aberta'
      });
      setVotacoesAbertas(votacoes);
    } catch (error) {
      console.error('Error loading votações:', error);
    }
  };

  const handleVotar = (votacao) => {
    setVotacaoSelecionada(votacao);
    setMostrarVotarModal(true);
  };

  const handleVotoSuccess = async () => {
    setMostrarVotarModal(false);
    setVotacaoSelecionada(null);
    // Reload votações to refresh the list
    if (assembleia) {
      await loadVotacoesAbertas(assembleia.id);
    }
  };

  const verificarJaVotou = async (votacaoId) => {
    if (!membro) return false;
    try {
      const votos = await base44.entities.Voto.filter({ 
        votacao_id: votacaoId,
        membro_id: membro.id
      });
      return votos.length > 0;
    } catch (error) {
      console.error('Error checking vote:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 50%, #E3F2FD 100%)' }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#1976D2' }} />
          <p style={{ color: '#757575' }}>Carregando assembleia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 50%, #E3F2FD 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <Shield className="w-10 h-10" style={{ color: '#1976D2' }} />
            <span className="text-2xl font-bold" style={{ color: '#212121' }}>VoteSecure</span>
          </div>

          <Card 
            className="border-2"
            style={{ 
              backgroundColor: '#FFEBEE',
              borderColor: '#EF9A9A',
              borderRadius: '12px',
              boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
            }}
          >
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#F44336' }} />
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#212121' }}>Erro</h1>
              <p className="mb-6" style={{ color: '#757575' }}>{error}</p>
              <Button 
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4"
      style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 50%, #E3F2FD 100%)' }}
    >
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-10 h-10" style={{ color: '#1976D2' }} />
          <span className="text-2xl font-bold" style={{ color: '#212121' }}>VoteSecure</span>
        </div>

        {/* Assembleia Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card 
            className="mb-6"
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
              background: 'white'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{assembleia?.nome}</span>
                <Badge style={{ backgroundColor: '#E8F5E9', color: '#4CAF50' }}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Presença Confirmada
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assembleia?.local && (
                <p className="text-sm" style={{ color: '#757575' }}>
                  <strong>Local:</strong> {assembleia.local}
                </p>
              )}
              {membro && (
                <p className="text-sm mt-2" style={{ color: '#757575' }}>
                  <strong>Participando como:</strong> {membro.nome_completo}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Votações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: '#212121' }}>
            Votações
          </h2>

          {votacoesAbertas.length === 0 ? (
            <Card 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                background: 'white'
              }}
            >
              <CardContent className="p-8 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4" style={{ color: '#1976D2' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#212121' }}>
                  Aguardando Votações
                </h3>
                <p style={{ color: '#757575' }}>
                  Sua presença está confirmada. Aguarde o início das votações.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {votacoesAbertas.map((votacao) => (
                <VotacaoCard
                  key={votacao.id}
                  votacao={votacao}
                  membro={membro}
                  onVotar={handleVotar}
                  verificarJaVotou={verificarJaVotou}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Votar Modal */}
      {votacaoSelecionada && membro && (
        <VotarModal
          open={mostrarVotarModal}
          onOpenChange={setMostrarVotarModal}
          votacao={votacaoSelecionada}
          membroId={membro.id}
          pesoVoto={membro.peso_voto || 1}
          onSuccess={handleVotoSuccess}
          tenantId={assembleia?.tenant_id}
          user={user}
        />
      )}
    </div>
  );
}

function VotacaoCard({ votacao, membro, onVotar, verificarJaVotou }) {
  const [jaVotou, setJaVotou] = useState(false);
  const [checkingVote, setCheckingVote] = useState(true);

  useEffect(() => {
    const checkVote = async () => {
      const votou = await verificarJaVotou(votacao.id);
      setJaVotou(votou);
      setCheckingVote(false);
    };
    checkVote();
  }, [votacao.id]);

  return (
    <Card 
      className="transition-all duration-300 hover:shadow-lg"
      style={{ 
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        background: 'white'
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#212121' }}>
              {votacao.titulo}
            </h3>
            {votacao.descricao && (
              <p className="text-sm mb-3" style={{ color: '#757575' }}>
                {votacao.descricao}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {votacao.tipo_voto}
              </Badge>
              {votacao.voto_secreto && (
                <Badge variant="secondary">Voto Secreto</Badge>
              )}
              {votacao.voto_qualificado && (
                <Badge variant="secondary">Voto Qualificado</Badge>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            {checkingVote ? (
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1976D2' }} />
            ) : jaVotou ? (
              <Badge style={{ backgroundColor: '#E8F5E9', color: '#4CAF50' }}>
                <CheckCircle className="w-3 h-3 mr-1" />
                Votado
              </Badge>
            ) : (
              <Button
                onClick={() => onVotar(votacao)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Vote className="w-4 h-4 mr-2" />
                Votar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}