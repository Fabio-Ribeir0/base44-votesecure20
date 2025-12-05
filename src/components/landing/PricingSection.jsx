import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";

const plans = [
  {
    id: 'basico',
    name: 'Básico',
    price: 49.90,
    stripePriceId: 'price_1Sa0HRQl8tMaegNcroBH6tF7',
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
    price: 99.90,
    stripePriceId: 'price_1Sa0HqQl8tMaegNcgEwz3CoK',
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
    price: 199.90,
    stripePriceId: 'price_1Sa0I8Ql8tMaegNcWquv4e8Z',
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
    id: 'empresarial',
    name: 'Empresarial',
    price: 399.90,
    stripePriceId: 'price_1Sa0ITQl8tMaegNclYHg46B8',
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
    <section className="py-20" id="planos" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4" style={{ backgroundColor: '#BBDEFB', color: '#1976D2' }}>
              <Zap className="w-3 h-3 mr-1" />
              10 dias grátis em todos os planos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#212121' }}>
              Escolha o plano ideal para sua
              <span style={{ color: '#1976D2' }}> organização</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#757575' }}>
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
              className="relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ 
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                border: plan.popular ? '2px solid #1976D2' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)';
              }}
            >
              {plan.popular && (
                <div 
                  className="absolute top-0 right-0 text-white px-3 py-1 text-xs font-medium rounded-bl-xl"
                  style={{ backgroundColor: '#1976D2' }}
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  Mais Popular
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold mb-1" style={{ color: '#212121' }}>{plan.name}</h3>
                <p className="text-sm mb-4" style={{ color: '#757575' }}>{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: '#212121' }}>R${plan.price.toFixed(2).replace('.', ',')}</span>
                  <span style={{ color: '#757575' }}>/mês</span>
                </div>

                <Button
                  onClick={() => onSelectPlan(plan)}
                  className="w-full mb-6 py-6 min-h-[56px] transition-all duration-300"
                  style={{ 
                    backgroundColor: plan.popular ? '#1976D2' : '#F5F5F5',
                    color: plan.popular ? 'white' : '#212121',
                    borderRadius: '12px',
                    boxShadow: plan.popular ? '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (plan.popular) {
                      e.currentTarget.style.backgroundColor = '#1565C0';
                    } else {
                      e.currentTarget.style.backgroundColor = '#E0E0E0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.popular) {
                      e.currentTarget.style.backgroundColor = '#1976D2';
                    } else {
                      e.currentTarget.style.backgroundColor = '#F5F5F5';
                    }
                  }}
                >
                  {isAuthenticated ? 'Começar Trial Grátis' : 'Começar Agora'}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#4CAF50' }} />
                      <span className="text-sm" style={{ color: '#757575' }}>{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 opacity-50">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="w-1.5 h-0.5 rounded" style={{ backgroundColor: '#9E9E9E' }} />
                      </div>
                      <span className="text-sm line-through" style={{ color: '#9E9E9E' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: '#757575' }}>
            Todos os preços em Reais (BRL). Cobranças mensais após o período de teste.
          </p>
        </div>
      </div>
    </section>
  );
}