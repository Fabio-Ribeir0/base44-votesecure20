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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para suas
              <span className="text-blue-600"> votações digitais</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
              className="group p-6 bg-gray-50 rounded-2xl hover:bg-blue-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm group-hover:text-blue-100 transition-colors">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}