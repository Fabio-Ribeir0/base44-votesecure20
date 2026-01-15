import React from 'react';
import { Shield, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#212121', color: '#BDBDBD' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-8 h-8" style={{ color: '#1976D2' }} />
              <span className="text-2xl font-bold text-white">VoteSecure</span>
            </div>
            <p className="mb-6 max-w-md" style={{ color: '#9E9E9E' }}>
              Sistema de votação eletrônica seguro, auditável e em conformidade com a LGPD. 
              Ideal para condomínios, igrejas, empresas e associações.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" style={{ color: '#1976D2' }} />
                <span>minimind.apps@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" style={{ color: '#1976D2' }} />
                <span>(11) 9999-9999</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" style={{ color: '#1976D2' }} />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-sm">
              {['Recursos', 'Planos', 'Segurança', 'Integrações'].map((item) => (
                <li key={item}>
                  <a 
                    href={item === 'Recursos' ? '#recursos' : item === 'Planos' ? '#planos' : '#'} 
                    className="transition-colors"
                    style={{ color: '#BDBDBD' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#64B5F6'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#BDBDBD'}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              {['Termos de Uso', 'Política de Privacidade', 'LGPD', 'Cookies'].map((item) => (
                <li key={item}>
                  <a 
                    href="#" 
                    className="transition-colors"
                    style={{ color: '#BDBDBD' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#64B5F6'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#BDBDBD'}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 text-center text-sm" style={{ borderTop: '1px solid #424242', color: '#757575' }}>
          <p>© {new Date().getFullYear()} VoteSecure. Todos os direitos reservados.</p>

          <span>Powered by</span>
            <a 
              href="https://www.instagram.com/minimind_apps/?hl=pt-br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690de11942f9615a68f4978d/83ed5c84d_image.png" 
                alt="MiniMind" 
                className="h-6 brightness-0 invert opacity-80"
              />
              <span className="text-sm font-semibold">MiniMind</span>
            </a>

        </div>
      </div>
    </footer>
  );
}