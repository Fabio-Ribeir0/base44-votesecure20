import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { createPageUrl } from '@/utils';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 50%, #E3F2FD 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-10 h-10" style={{ color: '#1976D2' }} />
          <span className="text-2xl font-bold" style={{ color: '#212121' }}>VoteSecure</span>
        </div>

        {/* 404 */}
        <div 
          className="text-8xl font-bold mb-4"
          style={{ color: '#1976D2' }}
        >
          404
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: '#212121' }}>
          Página não encontrada
        </h1>

        <p className="mb-8" style={{ color: '#757575' }}>
          A página que você está procurando não existe ou foi movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="min-h-[44px] transition-all duration-200"
            style={{ 
              borderColor: '#1976D2',
              color: '#1976D2',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#BBDEFB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-white min-h-[44px] transition-all duration-200"
            style={{ 
              backgroundColor: '#1976D2',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1565C0';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1976D2';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Início
          </Button>
        </div>

        <p className="text-center text-sm mt-8" style={{ color: '#757575' }}>
          Sistema de votação eletrônica seguro
        </p>
      </motion.div>
    </div>
  );
}