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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-10 h-10 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">VoteSecure</span>
        </div>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            {isLoading ? (
              <div className="py-8">
                <Loader2 className="w-16 h-16 text-green-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Processando seu pagamento...</p>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </motion.div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Pagamento Confirmado!
                </h1>

                <p className="text-gray-600 mb-6">
                  Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos do seu plano.
                </p>

                <div className="bg-white rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Próximos passos:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Cadastre os membros da sua organização
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Crie sua primeira assembleia
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Configure as votações
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={() => navigate(createPageUrl('Dashboard'))}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Ir para o Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Você receberá um email de confirmação em breve.
        </p>
      </motion.div>
    </div>
  );
}