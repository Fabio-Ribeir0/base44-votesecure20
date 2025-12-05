import React from 'react';
import { Shield, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">VoteSecure</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Sistema de votação eletrônica seguro, auditável e em conformidade com a LGPD. 
              Ideal para condomínios, igrejas, empresas e associações.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>contato@votesecure.com.br</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>(11) 9999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#recursos" className="hover:text-blue-400 transition-colors">Recursos</a></li>
              <li><a href="#planos" className="hover:text-blue-400 transition-colors">Planos</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Segurança</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Integrações</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">LGPD</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} VoteSecure. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}