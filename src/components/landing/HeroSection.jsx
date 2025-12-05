import React from 'react';
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection({ onGetStarted }) {
  return (
    <section 
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 50%, #E3F2FD 100%)' }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: '#BBDEFB', opacity: 0.5 }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: '#90CAF9', opacity: 0.3 }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: '#BBDEFB', color: '#1976D2' }}
            >
              <Shield className="w-4 h-4" />
              Votação Segura e Transparente
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#212121' }}>
              Transforme suas
              <span className="block" style={{ color: '#1976D2' }}>Assembleias Digitais</span>
            </h1>

            <p className="text-lg sm:text-xl mb-8 max-w-xl mx-auto lg:mx-0" style={{ color: '#757575' }}>
              Sistema completo para votações eletrônicas em condomínios, igrejas, empresas e associações. 
              Seguro, auditável e em conformidade com a LGPD.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="text-white px-8 py-6 text-lg min-h-[56px] transition-all duration-300"
                style={{ 
                  backgroundColor: '#1976D2',
                  borderRadius: '12px',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1565C0';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1976D2';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
                }}
              >
                Começar Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={onGetStarted}
                className="px-8 py-6 text-lg border-2 min-h-[56px] transition-all duration-300"
                style={{ 
                  borderColor: '#1976D2',
                  color: '#1976D2',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#BBDEFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Ver Planos
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm" style={{ color: '#757575' }}>
              {['10 dias grátis', 'Sem cartão de crédito', 'Cancele quando quiser'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: '#4CAF50' }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div 
                className="bg-white rounded-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500"
                style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)' }}
              >
                <div 
                  className="rounded-xl p-6 text-white"
                  style={{ background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8" />
                    <span className="text-xl font-bold">VoteSecure</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-sm opacity-80">Assembleia em andamento</p>
                      <p className="font-semibold">AGO 2024 - Condomínio Solar</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white/10 rounded-lg p-2">
                        <p className="text-2xl font-bold">156</p>
                        <p className="text-xs opacity-80">Votantes</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-2">
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-xs opacity-80">Pautas</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-2">
                        <p className="text-2xl font-bold">98%</p>
                        <p className="text-xs opacity-80">Quórum</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div 
                className="absolute -bottom-4 -left-4 text-white px-4 py-2 rounded-xl transform -rotate-3"
                style={{ backgroundColor: '#4CAF50', boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)' }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">100% Auditável</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}