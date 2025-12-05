import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";

const plans = [
  {
    id: 'basico',
    name: 'Básico',
    price: 97,
    priceId: 'STRIPE_BASICO_PRICE_ID',
    description: 'Para pequenas organizações',
    features: [
      'Até 50 membros',
      '2 assembleias/mês',
      '5 votações por assembleia',
      'Check-in por QR Code',
      'Relatórios básicos',
      'Suporte por email'
    ],
    notIncluded: [
      'Integração WhatsApp',
      'Voto secreto',
      'Voto qualificado',
      'Procuração digital'
    ]
  },
  {
    id: 'padrao',
    name: 'Padrão',
    price: 197,
    priceId: 'STRIPE_100_PRICE_ID',
    description: 'Para organizações em crescimento',
    popular: true,
    features: [
      'Até 200 membros',
      '5 assembleias/mês',
      '10 votações por assembleia',
      'Check-in por QR Code',
      'Integração WhatsApp',
      'Voto secreto',
      'Relatórios completos',
      'Suporte prioritário'
    ],
    notIncluded: [
      'Voto qualificado',
      'Procuração certificada'
    ]
  },
  {
    id: 'avancado',
    name: 'Avançado',
    price: 347,
    priceId: 'STRIPE_200_PRICE_ID',
    description: 'Para organizações exigentes',
    features: [
      'Até 500 membros',
      '15 assembleias/mês',
      'Votações ilimitadas',
      'Check-in por QR Code',
      'Integração WhatsApp',
      'Voto secreto',
      'Voto qualificado',
      'Procuração digital',
      'Relatórios avançados',
      'Suporte prioritário'
    ],
    notIncluded: []
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 597,
    priceId: 'STRIPE_500_PRICE_ID',
    description: 'Para grandes organizações',
    features: [
      'Membros ilimitados',
      'Assembleias ilimitadas',
      'Votações ilimitadas',
      'Todos os recursos',
      'Procuração com certificado',
      'API personalizada',
      'Gerente de conta dedicado',
      'SLA garantido',
      'Customizações sob demanda'
    ],
    notIncluded: []
  }
];

export default function PricingSection({ onSelectPlan, isAuthenticated }) {
  return (
    <section className="py-20 bg-gray-50" id="planos">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-blue-100 text-blue-700 mb-4">
              <Zap className="w-3 h-3 mr-1" />
              10 dias grátis em todos os planos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para sua
              <span className="text-blue-600"> organização</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Teste grátis por 10 dias, sem compromisso. Cancele a qualquer momento antes da cobrança.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded-bl-xl">
                  <Star className="w-3 h-3 inline mr-1" />
                  Mais Popular
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">R${plan.price}</span>
                  <span className="text-gray-500">/mês</span>
                </div>

                <Button
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full mb-6 rounded-xl py-6 transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {isAuthenticated ? 'Começar Trial Grátis' : 'Começar Agora'}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 opacity-50">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="w-1.5 h-0.5 bg-gray-400 rounded" />
                      </div>
                      <span className="text-sm text-gray-400 line-through">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Todos os preços em Reais (BRL). Cobranças mensais após o período de teste.
          </p>
        </div>
      </div>
    </section>
  );
}