import React, { useState } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { Loader2, Mail, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PERFIS = ['Administrador', 'Presidente', 'Secretário', 'Observador', 'Membro Votante'];

export default function ConviteUsuarioModal({ open, onOpenChange, tenantId, tenantNome, onSuccess }) {
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState('Membro Votante');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Informe o email do usuário');
      return;
    }

    setIsLoading(true);
    try {
      // Enviar email de convite via integração de email
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `Convite para participar do VoteSecure - ${tenantNome}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">🗳️ VoteSecure</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Você foi convidado!</h2>
              <p style="color: #4b5563; line-height: 1.6;">
                Você foi convidado para participar da organização <strong>${tenantNome}</strong> no VoteSecure, 
                a plataforma de votação digital mais segura do Brasil.
              </p>
              <p style="color: #4b5563; line-height: 1.6;">
                <strong>Seu perfil de acesso:</strong> ${perfil}
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}" 
                   style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Acessar VoteSecure
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Ao acessar, faça login com este email (${email}) para ser automaticamente vinculado à organização.
              </p>
            </div>
            <div style="background: #1f2937; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} VoteSecure. Todos os direitos reservados.
              </p>
            </div>
          </div>
        `
      });

      toast.success(`Convite enviado para ${email}`);
      setEmail('');
      setPerfil('Membro Votante');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Erro ao enviar convite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Convidar Usuário
          </DialogTitle>
          <DialogDescription>
            Envie um convite por email para um novo usuário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@email.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Perfil de Acesso</Label>
            <Select value={perfil} onValueChange={setPerfil}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERFIS.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              O usuário poderá alterar o perfil após aceitar o convite
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Convite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}