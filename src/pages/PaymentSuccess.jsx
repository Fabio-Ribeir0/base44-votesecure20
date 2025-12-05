import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { CheckCircle, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import confetti from 'canvas-confetti';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPayment = async () => {
      try {
        // Fire confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    checkPayment();
  }, []);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 50%, #E3F2FD 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
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
            backgroundColor: '#E8F5E9', 
            borderColor: '#81C784',
            borderRadius: '12px',
            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
          }}
        >
          <CardContent className="p-8 text-center">
            {isLoading ? (
              <div className="py-8">
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: '#4CAF50' }} />
                <p style={{ color: '#757575' }}>Processando seu pagamento...</p>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="mb-6"
                >
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: '#C8E6C9' }}
                  >
                    <CheckCircle className="w-12 h-12" style={{ color: '#4CAF50' }} />
                  </div>
                </motion.div>

                <h1 className="text-2xl font-bold mb-2" style={{ color: '#212121' }}>
                  Pagamento Confirmado!
                </h1>

                <p className="mb-6" style={{ color: '#757575' }}>
                  Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos do seu plano.
                </p>

                <div 
                  className="rounded-lg p-4 mb-6 text-left"
                  style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: '#212121' }}>Próximos passos:</h3>
                  <ul className="space-y-2 text-sm" style={{ color: '#757575' }}>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />
                      Cadastre os membros da sua organização
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />
                      Crie sua primeira assembleia
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />
                      Configure as votações
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={() => navigate(createPageUrl('Dashboard'))}
                  className="w-full text-white min-h-[44px] transition-all duration-200"
                  style={{ 
                    backgroundColor: '#4CAF50',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#388E3C';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4CAF50';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Ir para o Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-6" style={{ color: '#757575' }}>
          Você receberá um email de confirmação em breve.
        </p>
      </motion.div>
    </div>
  );
}