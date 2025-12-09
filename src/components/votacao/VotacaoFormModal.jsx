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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Loader2 } from "lucide-react";
import { AuditLogger } from '@/components/audit/AuditLogger';

export default function VotacaoFormModal({ open, onOpenChange, votacao, assembleiaId, userId, onSuccess, tenantId, user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo_voto: 'Escolha Única',
    voto_secreto: false,
    voto_qualificado: false,
    permite_abstencao: true,
    opcoes: ['', '']
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (votacao) {
      setFormData({
        titulo: votacao.titulo || '',
        descricao: votacao.descricao || '',
        tipo_voto: votacao.tipo_voto || 'Escolha Única',
        voto_secreto: votacao.voto_secreto || false,
        voto_qualificado: votacao.voto_qualificado || false,
        permite_abstencao: votacao.permite_abstencao !== false,
        opcoes: votacao.opcoes || ['', '']
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        tipo_voto: 'Escolha Única',
        voto_secreto: false,
        voto_qualificado: false,
        permite_abstencao: true,
        opcoes: ['', '']
      });
    }
    setErrors({});
  }, [votacao, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      opcoes: [...prev.opcoes, '']
    }));
  };

  const handleRemoveOption = (index) => {
    if (formData.opcoes.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      opcoes: prev.opcoes.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      opcoes: prev.opcoes.map((opt, i) => i === index ? value : opt)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'Título é obrigatório';
    
    const validOptions = formData.opcoes.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      newErrors.opcoes = 'Pelo menos 2 opções são necessárias';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const validOptions = formData.opcoes.filter(opt => opt.trim());
      const data = {
        assembleia_id: assembleiaId,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        tipo_voto: formData.tipo_voto,
        voto_secreto: formData.voto_secreto,
        voto_qualificado: formData.voto_qualificado,
        permite_abstencao: formData.permite_abstencao,
        opcoes: validOptions,
        status: 'Pendente',
        criado_por: userId
      };

      if (votacao) {
        await base44.entities.Votacao.update(votacao.id, data);
        toast.success('Votação atualizada!');
        
        // Log audit
        if (tenantId && user) {
          AuditLogger.logUpdate('Votacao', votacao.id,
            `Votação "${data.titulo}" atualizada`,
            tenantId, user
          );
        }
      } else {
        const newVotacao = await base44.entities.Votacao.create(data);
        toast.success('Votação criada!');
        
        // Log audit
        if (tenantId && user) {
          AuditLogger.logCreate('Votacao', newVotacao.id,
            `Votação "${data.titulo}" criada`,
            tenantId, user
          );
        }
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving votacao:', error);
      toast.error('Erro ao salvar votação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-smooth-fade sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{votacao ? 'Editar Votação' : 'Nova Votação'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Votação *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ex: Aprovação do orçamento 2024"
              className={errors.titulo ? 'border-red-500' : ''}
            />
            {errors.titulo && <p className="text-xs text-red-500">{errors.titulo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Detalhes sobre a votação..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Votação</Label>
            <Select value={formData.tipo_voto} onValueChange={(v) => handleChange('tipo_voto', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Escolha Única">Escolha Única</SelectItem>
                <SelectItem value="Múltipla Escolha">Múltipla Escolha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Opções de Voto *</Label>
            {formData.opcoes.map((opcao, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={opcao}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Opção ${index + 1}`}
                />
                {formData.opcoes.length > 2 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.opcoes && <p className="text-xs text-red-500">{errors.opcoes}</p>}
            <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Opção
            </Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Voto Secreto</p>
                <p className="text-xs text-gray-500">Não registra quem votou em quê</p>
              </div>
              <Switch
                checked={formData.voto_secreto}
                onCheckedChange={(v) => handleChange('voto_secreto', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Voto Qualificado</p>
                <p className="text-xs text-gray-500">Aplica peso do voto do membro</p>
              </div>
              <Switch
                checked={formData.voto_qualificado}
                onCheckedChange={(v) => handleChange('voto_qualificado', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Permitir Abstenção</p>
                <p className="text-xs text-gray-500">Membros podem se abster</p>
              </div>
              <Switch
                checked={formData.permite_abstencao}
                onCheckedChange={(v) => handleChange('permite_abstencao', v)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                votacao ? 'Atualizar' : 'Criar Votação'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}