import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
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

      // Find member by user's tenant
      if (!user.tenant_id || user.tenant_id !== assembleiaData.tenant_id) {
        setStatus('error');
        setMessage('Você não é membro desta organização');
        setIsLoading(false);
        return;
      }

      // Find member record
      const membros = await base44.entities.Membro.filter({ 
        tenant_id: assembleiaData.tenant_id 
      });
      
      // Try to find member by email or by any criteria
      const membro = membros.find(m => 
        m.email === user.email || 
        m.nome_completo?.toLowerCase() === user.full_name?.toLowerCase()
      );

      if (!membro) {
        setStatus('error');
        setMessage('Seu cadastro de membro não foi encontrado. Entre em contato com o administrador.');
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
      setMessage('Check-in realizado com sucesso!');

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
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'already_checked':
        return <CheckCircle className="w-16 h-16 text-blue-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'already_checked':
        return 'bg-blue-50 border-blue-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-10 h-10 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">VoteSecure</span>
        </div>

        <Card className={`border-2 ${getStatusColor()}`}>
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              {getStatusIcon()}
            </motion.div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'loading' && 'Processando Check-in...'}
              {status === 'success' && 'Check-in Confirmado!'}
              {status === 'already_checked' && 'Já Registrado'}
              {status === 'error' && 'Ops!'}
            </h1>

            <p className="text-gray-600 mb-6">{message}</p>

            {assembleia && (
              <div className="bg-white rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-500">Assembleia</p>
                <p className="font-semibold text-gray-900">{assembleia.nome}</p>
                {assembleia.local && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">Local</p>
                    <p className="text-gray-700">{assembleia.local}</p>
                  </>
                )}
              </div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-2 text-green-600 bg-green-100 rounded-lg p-3"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Sua presença foi registrada</span>
              </motion.div>
            )}

            {status === 'error' && (
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4"
              >
                Tentar Novamente
              </Button>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sistema de votação eletrônica seguro
        </p>
      </motion.div>
    </div>
  );
}