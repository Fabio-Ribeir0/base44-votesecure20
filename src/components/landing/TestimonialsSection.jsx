import React from 'react';
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Síndica",
    company: "Condomínio Parque Verde",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "O VoteSecure revolucionou nossas assembleias. Antes tínhamos problemas com quórum e contagem de votos. Agora tudo é digital, rápido e transparente.",
    rating: 5
  },
  {
    name: "Pastor João Santos",
    role: "Líder",
    company: "Igreja Comunidade da Fé",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "Nossa igreja consegue fazer votações importantes mesmo com membros em outras cidades. A funcionalidade de procuração digital foi um diferencial.",
    rating: 5
  },
  {
    name: "Ana Rodrigues",
    role: "Diretora Executiva",
    company: "Associação Empresarial ABC",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "A segurança e conformidade com LGPD eram requisitos obrigatórios para nós. O VoteSecure atendeu todas as exigências e ainda é muito fácil de usar.",
    rating: 5
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#212121' }}>
              O que nossos clientes
              <span style={{ color: '#1976D2' }}> dizem</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#757575' }}>
              Organizações de todo Brasil confiam no VoteSecure para suas votações eletrônicas.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl p-8 relative"
              style={{ 
                backgroundColor: '#F5F5F5',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
              }}
            >
              <Quote className="absolute top-6 right-6 w-8 h-8" style={{ color: '#BBDEFB' }} />
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5" style={{ fill: '#FFB300', color: '#FFB300' }} />
                ))}
              </div>

              <p className="mb-6 leading-relaxed" style={{ color: '#757575' }}>
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold" style={{ color: '#212121' }}>{testimonial.name}</p>
                  <p className="text-sm" style={{ color: '#757575' }}>{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}