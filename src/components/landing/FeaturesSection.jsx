import React from 'react';
import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Vote, 
  FileCheck, 
  MessageSquare, 
  BarChart3, 
  Lock, 
  QrCode 
} from "lucide-react";

const features = [
  {
    icon: Vote,
    title: "Votações Flexíveis",
    description: "Escolha única, múltipla, votos secretos e qualificados. Configure as regras que sua organização precisa."
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Criptografia de ponta a ponta, logs de auditoria completos e conformidade com LGPD."
  },
  {
    icon: Users,
    title: "Gestão de Membros",
    description: "Cadastre membros, defina permissões, gerencie procurações e controle presenças."
  },
  {
    icon: QrCode,
    title: "Check-in Inteligente",
    description: "QR Code, link por WhatsApp ou check-in manual. Múltiplas formas de registrar presença."
  },
  {
    icon: MessageSquare,
    title: "Integração WhatsApp",
    description: "Envie convites e notificações automaticamente via WhatsApp para seus membros."
  },
  {
    icon: FileCheck,
    title: "Procurações Digitais",
    description: "Sistema completo de procurações com validação por SMS e assinatura digital."
  },
  {
    icon: BarChart3,
    title: "Relatórios Completos",
    description: "Dashboards em tempo real, relatórios de participação e exportação em PDF."
  },
  {
    icon: Lock,
    title: "Multi-tenant",
    description: "Cada organização tem seu ambiente isolado e seguro. Dados completamente separados."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white" id="recursos">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#212121' }}>
              Tudo que você precisa para suas
              <span style={{ color: '#1976D2' }}> votações digitais</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#757575' }}>
              Recursos poderosos e intuitivos para transformar a forma como sua organização realiza assembleias e votações.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{ 
                backgroundColor: '#F5F5F5',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1976D2';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)';
                e.currentTarget.querySelector('.feature-icon-container').style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.querySelector('.feature-icon').style.color = 'white';
                e.currentTarget.querySelector('.feature-title').style.color = 'white';
                e.currentTarget.querySelector('.feature-desc').style.color = '#BBDEFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F5';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)';
                e.currentTarget.querySelector('.feature-icon-container').style.backgroundColor = '#BBDEFB';
                e.currentTarget.querySelector('.feature-icon').style.color = '#1976D2';
                e.currentTarget.querySelector('.feature-title').style.color = '#212121';
                e.currentTarget.querySelector('.feature-desc').style.color = '#757575';
              }}
            >
              <div 
                className="feature-icon-container w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                style={{ backgroundColor: '#BBDEFB' }}
              >
                <feature.icon className="feature-icon w-6 h-6 transition-colors" style={{ color: '#1976D2' }} />
              </div>
              <h3 className="feature-title text-lg font-semibold mb-2 transition-colors" style={{ color: '#212121' }}>
                {feature.title}
              </h3>
              <p className="feature-desc text-sm transition-colors" style={{ color: '#757575' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}