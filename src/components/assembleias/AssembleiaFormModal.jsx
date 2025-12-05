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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CalendarDays } from "lucide-react";

export default function AssembleiaFormModal({ open, onOpenChange, assembleia, tenantId, userId, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    data_hora_inicio: '',
    data_hora_fim: '',
    local: '',
    descricao: '',
    quorum_minimo: 0,
    tipo_referendacao: 'Automática'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (assembleia) {
      setFormData({
        nome: assembleia.nome || '',
        data_hora_inicio: assembleia.data_hora_inicio ? assembleia.data_hora_inicio.slice(0, 16) : '',
        data_hora_fim: assembleia.data_hora_fim ? assembleia.data_hora_fim.slice(0, 16) : '',
        local: assembleia.local || '',
        descricao: assembleia.descricao || '',
        quorum_minimo: assembleia.quorum_minimo || 0,
        tipo_referendacao: assembleia.tipo_referendacao || 'Automática'
      });
    } else {
      setFormData({
        nome: '',
        data_hora_inicio: '',
        data_hora_fim: '',
        local: '',
        descricao: '',
        quorum_minimo: 0,
        tipo_referendacao: 'Automática'
      });
    }
    setErrors({});
  }, [assembleia, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.data_hora_inicio) newErrors.data_hora_inicio = 'Data de início é obrigatória';
    if (formData.data_hora_fim && new Date(formData.data_hora_fim) <= new Date(formData.data_hora_inicio)) {
      newErrors.data_hora_fim = 'Data de fim deve ser posterior à data de início';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = {
        ...formData,
        data_hora_inicio: new Date(formData.data_hora_inicio).toISOString(),
        data_hora_fim: formData.data_hora_fim ? new Date(formData.data_hora_fim).toISOString() : null,
        quorum_minimo: parseInt(formData.quorum_minimo) || 0
      };

      if (assembleia) {
        await base44.entities.Assembleia.update(assembleia.id, data);
        toast.success('Assembleia atualizada com sucesso!');
      } else {
        await base44.entities.Assembleia.create({
          ...data,
          tenant_id: tenantId,
          criado_por: userId,
          status: 'Agendada',
          qr_code_checkin_token: generateToken()
        });
        toast.success('Assembleia criada com sucesso!');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving assembleia:', error);
      toast.error('Erro ao salvar assembleia');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle>
              {assembleia ? 'Editar Assembleia' : 'Nova Assembleia'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Assembleia *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Assembleia Geral Ordinária 2024"
              className={errors.nome ? 'border-red-500' : ''}
            />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_hora_inicio">Data/Hora Início *</Label>
              <Input
                id="data_hora_inicio"
                type="datetime-local"
                value={formData.data_hora_inicio}
                onChange={(e) => handleChange('data_hora_inicio', e.target.value)}
                className={errors.data_hora_inicio ? 'border-red-500' : ''}
              />
              {errors.data_hora_inicio && <p className="text-xs text-red-500">{errors.data_hora_inicio}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_hora_fim">Data/Hora Fim</Label>
              <Input
                id="data_hora_fim"
                type="datetime-local"
                value={formData.data_hora_fim}
                onChange={(e) => handleChange('data_hora_fim', e.target.value)}
                className={errors.data_hora_fim ? 'border-red-500' : ''}
              />
              {errors.data_hora_fim && <p className="text-xs text-red-500">{errors.data_hora_fim}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input
              id="local"
              value={formData.local}
              onChange={(e) => handleChange('local', e.target.value)}
              placeholder="Ex: Salão de festas, Bloco A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descreva a pauta e objetivos da assembleia..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quorum_minimo">Quórum Mínimo (%)</Label>
              <Input
                id="quorum_minimo"
                type="number"
                min="0"
                max="100"
                value={formData.quorum_minimo}
                onChange={(e) => handleChange('quorum_minimo', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_referendacao">Tipo de Referendação</Label>
              <Select
                value={formData.tipo_referendacao}
                onValueChange={(value) => handleChange('tipo_referendacao', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automática">Automática</SelectItem>
                  <SelectItem value="Presidente">Presidente</SelectItem>
                  <SelectItem value="Secretário">Secretário</SelectItem>
                </SelectContent>
              </Select>
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
                assembleia ? 'Atualizar' : 'Criar Assembleia'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}