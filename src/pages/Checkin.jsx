import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AuditLogger } from '@/components/audit/AuditLogger';

export default function Checkin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('loading'); // loading, success, error, already_checked
  const [message, setMessage] = useState('');
  const [assembleia, setAssembleia] = useState(null);

  useEffect(() => {
    processCheckin();
  }, []);

  const processCheckin = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de check-in inválido');
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }

      const user = await base44.auth.me();
      const newEmail = user.email;
      console.log('New email: ', newEmail);

      // Find assembleia by token
      const assembleias = await base44.entities.Assembleia.filter({ qr_code_checkin_token: token });
      
      if (assembleias.length === 0) {
        setStatus('error');
        setMessage('Assembleia não encontrada ou token inválido');
        setIsLoading(false);
        return;
      }

      const assembleiaData = assembleias[0];
      setAssembleia(assembleiaData);

      // Check if assembleia is active
      if (!['Agendada', 'Em andamento'].includes(assembleiaData.status)) {
        setStatus('error');
        setMessage('Esta assembleia não está mais ativa');
        setIsLoading(false);
        return;
      }

      // Check if token is expired (assembleia ended)
      if (assembleiaData.data_hora_fim && new Date(assembleiaData.data_hora_fim) < new Date()) {
        setStatus('error');
        setMessage('O período de check-in para esta assembleia expirou');
        setIsLoading(false);
        return;
      }

      // Find member record directly by email and tenant_id
      const membrosEncontrados = await base44.entities.Membro.filter({ 
        tenant_id: assembleiaData.tenant_id,
        email: newEmail//user.email
      });
      
      const membro = membrosEncontrados[0];

      if (!membro) {
        setStatus('error');
        setMessage('Seu cadastro de membro não foi encontrado para esta assembleia. Verifique se o e-mail cadastrado corresponde ao seu e-mail de login ou entre em contato com o administrador.');
        setIsLoading(false);
        return;
      }

      if (!membro.ativo) {
        setStatus('error');
        setMessage('Seu cadastro de membro está inativo');
        setIsLoading(false);
        return;
      }

      // Check if already checked in
      const existingCheckins = await base44.entities.CheckIn.filter({ 
        assembleia_id: assembleiaData.id,
        membro_id: membro.id
      });

      if (existingCheckins.length > 0) {
        setStatus('already_checked');
        setMessage('Você já fez check-in nesta assembleia');
        setIsLoading(false);
        return;
      }

      // Create check-in
      await base44.entities.CheckIn.create({
        assembleia_id: assembleiaData.id,
        membro_id: membro.id,
        data_hora: new Date().toISOString(),
        metodo: 'QR Code'
      });

      // Log audit
      AuditLogger.logCheckin(assembleiaData.id,
        `Check-in via QR Code de "${membro.nome_completo}" na assembleia "${assembleiaData.nome}"`,
        assembleiaData.tenant_id, user
      );

      setStatus('success');
      setMessage('Check-in realizado com sucesso! Você será redirecionado para a votação.');

      // Redirect to voting page after 2 seconds
      setTimeout(() => {
        navigate(createPageUrl(`VotacaoMembro?assembleiaId=${assembleiaData.id}`));
      }, 2000);

    } catch (error) {
      console.error('Error processing checkin:', error);
      setStatus('error');
      setMessage('Erro ao processar check-in. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16" style={{ color: '#4CAF50' }} />;
      case 'already_checked':
        return <CheckCircle className="w-16 h-16" style={{ color: '#1976D2' }} />;
      case 'error':
        return <XCircle className="w-16 h-16" style={{ color: '#F44336' }} />;
      default:
        return <Loader2 className="w-16 h-16 animate-spin" style={{ color: '#1976D2' }} />;
    }
  };

  const getStatusStyle = () => {
    switch (status) {
      case 'success':
        return { backgroundColor: '#E8F5E9', borderColor: '#81C784' };
      case 'already_checked':
        return { backgroundColor: '#E3F2FD', borderColor: '#64B5F6' };
      case 'error':
        return { backgroundColor: '#FFEBEE', borderColor: '#EF9A9A' };
      default:
        return { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' };
    }
  };

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
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-10 h-10" style={{ color: '#1976D2' }} />
          <span className="text-2xl font-bold" style={{ color: '#212121' }}>VoteSecure</span>
        </div>

        <Card 
          className="border-2"
          style={{ 
            ...getStatusStyle(),
            borderRadius: '12px',
            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
          }}
        >
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              {getStatusIcon()}
            </motion.div>

            <h1 className="text-2xl font-bold mb-2" style={{ color: '#212121' }}>
              {status === 'loading' && 'Processando Check-in...'}
              {status === 'success' && 'Check-in Confirmado!'}
              {status === 'already_checked' && 'Já Registrado'}
              {status === 'error' && 'Ops!'}
            </h1>

            <p className="mb-6" style={{ color: '#757575' }}>{message}</p>

            {assembleia && (
              <div className="bg-white rounded-lg p-4 mb-6 text-left" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}>
                <p className="text-sm" style={{ color: '#757575' }}>Assembleia</p>
                <p className="font-semibold" style={{ color: '#212121' }}>{assembleia.nome}</p>
                {assembleia.local && (
                  <>
                    <p className="text-sm mt-2" style={{ color: '#757575' }}>Local</p>
                    <p style={{ color: '#424242' }}>{assembleia.local}</p>
                  </>
                )}
              </div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 rounded-lg p-3"
                style={{ backgroundColor: '#E8F5E9', color: '#4CAF50' }}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Sua presença foi registrada</span>
              </motion.div>
            )}

            {status === 'error' && (
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4 min-h-[44px] transition-all duration-200"
                style={{ borderColor: '#1976D2', color: '#1976D2', borderRadius: '8px' }}
              >
                Tentar Novamente
              </Button>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-6" style={{ color: '#757575' }}>
          Sistema de votação eletrônica seguro
        </p>
      </motion.div>
    </div>
  );
}