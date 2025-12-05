import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle } from "lucide-react";

export default function CTASection({ onGetStarted }) {
  return (
    <section 
      className="py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)' }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div 
            className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <Shield className="w-4 h-4" />
            Comece seu teste gratuito hoje
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto para transformar suas
            <span className="block">assembleias digitais?</span>
          </h2>

          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#BBDEFB' }}>
            Junte-se a centenas de organizações que já modernizaram suas votações com o VoteSecure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="px-8 py-6 text-lg min-h-[56px] transition-all duration-300"
              style={{ 
                backgroundColor: 'white',
                color: '#1976D2',
                borderRadius: '12px',
                boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E3F2FD';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
              }}
            >
              Começar Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 justify-center text-sm" style={{ color: '#BBDEFB' }}>
            {['Configuração em 5 minutos', 'Suporte em português', 'Cancele quando quiser'].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}