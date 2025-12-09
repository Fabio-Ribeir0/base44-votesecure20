import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { Loader2, User } from "lucide-react";
import { AuditLogger } from '@/components/audit/AuditLogger';

const TIPOS_MEMBRO = ['Proprietário', 'Inquilino', 'Representante', 'Outro'];

export default function MemberFormModal({ open, onOpenChange, member, tenantId, tenantNome, onSuccess, user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    documento: '',
    endereco: '',
    tipo_membro: 'Proprietário',
    peso_voto: 1,
    ativo: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData({
        nome_completo: member.nome_completo || '',
        email: member.email || '',
        telefone: member.telefone || '',
        documento: member.documento || '',
        endereco: member.endereco || '',
        tipo_membro: member.tipo_membro || 'Proprietário',
        peso_voto: member.peso_voto || 1,
        ativo: member.ativo !== false
      });
    } else {
      setFormData({
        nome_completo: '',
        email: '',
        telefone: '',
        documento: '',
        endereco: '',
        tipo_membro: 'Proprietário',
        peso_voto: 1,
        ativo: true
      });
    }
    setErrors({});
  }, [member, open]);

  /*const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };*/



  

    const handleChange = (field, value) => {
    // Normaliza email ao digitar
    if (field === 'email') {
        value = value.trim().toLowerCase();
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
    }
    };






  const validate = () => {
    const newErrors = {};
    if (!formData.nome_completo.trim()) newErrors.nome_completo = 'Nome é obrigatório';
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
    if (formData.peso_voto < 1) newErrors.peso_voto = 'Peso deve ser pelo menos 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (member) {
        await base44.entities.Membro.update(member.id, formData);
        toast.success('Membro atualizado com sucesso!');
        
        // Log audit
        if (user) {
          AuditLogger.logUpdate('Membro', member.id,
            `Membro "${formData.nome_completo}" atualizado`,
            tenantId, user
          );
        }
      } else {
        const newMembro = await base44.entities.Membro.create({
          ...formData,
          tenant_id: tenantId
        });
        toast.success('Membro cadastrado com sucesso!');
        
        // Log audit
        if (user) {
          AuditLogger.logCreate('Membro', newMembro.id,
            `Membro "${formData.nome_completo}" cadastrado`,
            tenantId, user
          );
        }

        // Send welcome email if member has email and is new user
        if (formData.email && tenantNome) {
          try {
            const emailResult = await base44.functions.invoke('notificarNovoMembro', {
              membro_email: formData.email,
              membro_nome: formData.nome_completo,
              tenant_nome: tenantNome,
              tenant_id: tenantId
            });
            
            if (emailResult.data?.email_sent) {
              toast.success('E-mail de boas-vindas enviado!', { duration: 3000 });
            } else if (emailResult.data?.user_exists) {
              console.log('Usuário já existe no sistema, e-mail não enviado');
            }
          } catch (emailError) {
            console.error('Erro ao enviar e-mail de boas-vindas:', emailError);
            // Não mostra erro ao usuário, apenas loga
          }
        }
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Erro ao salvar membro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-smooth-fade sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle>
              {member ? 'Editar Membro' : 'Adicionar Membro'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_completo">Nome Completo *</Label>
            <Input
              id="nome_completo"
              value={formData.nome_completo}
              onChange={(e) => handleChange('nome_completo', e.target.value)}
              placeholder="Nome completo do membro"
              className={errors.nome_completo ? 'border-red-500' : ''}
            />
            {errors.nome_completo && <p className="text-xs text-red-500">{errors.nome_completo}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.telefone ? 'border-red-500' : ''}
              />
              {errors.telefone && <p className="text-xs text-red-500">{errors.telefone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documento">Documento (CPF/RG)</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => handleChange('documento', e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_membro">Tipo de Membro</Label>
              <Select
                value={formData.tipo_membro}
                onValueChange={(value) => handleChange('tipo_membro', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_MEMBRO.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              placeholder="Endereço completo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso_voto">Peso do Voto</Label>
              <Input
                id="peso_voto"
                type="number"
                min="1"
                value={formData.peso_voto}
                onChange={(e) => handleChange('peso_voto', parseInt(e.target.value) || 1)}
                className={errors.peso_voto ? 'border-red-500' : ''}
              />
              {errors.peso_voto && <p className="text-xs text-red-500">{errors.peso_voto}</p>}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) => handleChange('ativo', checked)}
                />
                <span className="text-sm text-gray-600">
                  {formData.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                member ? 'Atualizar' : 'Cadastrar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}