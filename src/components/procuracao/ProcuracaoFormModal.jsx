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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, FileText } from "lucide-react";
import { AuditLogger } from '@/components/audit/AuditLogger';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProcuracaoFormModal({ open, onOpenChange, procuracao, tenantId, membros = [], assembleias = [], onSuccess, user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    outorgante_id: '',
    procurador_id: '',
    assembleia_id: '',
    data_inicio: null,
    data_fim: null,
    tipo: 'Simples',
    observacoes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (procuracao) {
      setFormData({
        outorgante_id: procuracao.outorgante_id || '',
        procurador_id: procuracao.procurador_id || '',
        assembleia_id: procuracao.assembleia_id || '',
        data_inicio: procuracao.data_inicio ? new Date(procuracao.data_inicio) : null,
        data_fim: procuracao.data_fim ? new Date(procuracao.data_fim) : null,
        tipo: procuracao.tipo || 'Simples',
        observacoes: procuracao.observacoes || ''
      });
    } else {
      setFormData({
        outorgante_id: '',
        procurador_id: '',
        assembleia_id: '',
        data_inicio: new Date(),
        data_fim: null,
        tipo: 'Simples',
        observacoes: ''
      });
    }
    setErrors({});
  }, [procuracao, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.outorgante_id) newErrors.outorgante_id = 'Selecione o outorgante';
    if (!formData.procurador_id) newErrors.procurador_id = 'Selecione o procurador';
    if (formData.outorgante_id === formData.procurador_id) {
      newErrors.procurador_id = 'Procurador deve ser diferente do outorgante';
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
        tenant_id: tenantId,
        outorgante_id: formData.outorgante_id,
        procurador_id: formData.procurador_id,
        assembleia_id: formData.assembleia_id || null,
        data_inicio: formData.data_inicio?.toISOString() || new Date().toISOString(),
        data_fim: formData.data_fim?.toISOString() || null,
        tipo: formData.tipo,
        observacoes: formData.observacoes.trim(),
        status: 'Ativa'
      };

      if (procuracao) {
        await base44.entities.Procuracao.update(procuracao.id, data);
        toast.success('Procuração atualizada!');
        
        // Log audit
        if (user) {
          const outorgante = membros.find(m => m.id === data.outorgante_id)?.nome_completo || 'Desconhecido';
          const procurador = membros.find(m => m.id === data.procurador_id)?.nome_completo || 'Desconhecido';
          AuditLogger.logUpdate('Procuracao', procuracao.id,
            `Procuração de "${outorgante}" para "${procurador}" atualizada`,
            tenantId, user
          );
        }
      } else {
        const newProcuracao = await base44.entities.Procuracao.create(data);
        toast.success('Procuração criada!');
        
        // Log audit
        if (user) {
          const outorgante = membros.find(m => m.id === data.outorgante_id)?.nome_completo || 'Desconhecido';
          const procurador = membros.find(m => m.id === data.procurador_id)?.nome_completo || 'Desconhecido';
          AuditLogger.logCreate('Procuracao', newProcuracao.id,
            `Procuração de "${outorgante}" para "${procurador}" criada`,
            tenantId, user
          );
        }
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving procuracao:', error);
      toast.error('Erro ao salvar procuração');
    } finally {
      setIsLoading(false);
    }
  };

  const getMemberName = (id) => membros.find(m => m.id === id)?.nome_completo || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {procuracao ? 'Editar Procuração' : 'Nova Procuração'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Outorgante (quem concede) *</Label>
            <Select 
              value={formData.outorgante_id} 
              onValueChange={(v) => handleChange('outorgante_id', v)}
            >
              <SelectTrigger className={errors.outorgante_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o outorgante" />
              </SelectTrigger>
              <SelectContent>
                {membros.filter(m => m.ativo !== false).map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.nome_completo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.outorgante_id && <p className="text-xs text-red-500">{errors.outorgante_id}</p>}
          </div>

          <div className="space-y-2">
            <Label>Procurador (quem recebe) *</Label>
            <Select 
              value={formData.procurador_id} 
              onValueChange={(v) => handleChange('procurador_id', v)}
            >
              <SelectTrigger className={errors.procurador_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o procurador" />
              </SelectTrigger>
              <SelectContent>
                {membros
                  .filter(m => m.ativo !== false && m.id !== formData.outorgante_id)
                  .map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome_completo}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.procurador_id && <p className="text-xs text-red-500">{errors.procurador_id}</p>}
          </div>

          <div className="space-y-2">
            <Label>Assembleia (opcional)</Label>
            <Select 
              value={formData.assembleia_id || 'todas'} 
              onValueChange={(v) => handleChange('assembleia_id', v === 'todas' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as assembleias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as assembleias</SelectItem>
                {assembleias.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Deixe em branco para valer em todas</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_inicio 
                      ? format(formData.data_inicio, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecione'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_inicio}
                    onSelect={(date) => handleChange('data_inicio', date)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Fim (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_fim 
                      ? format(formData.data_fim, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Indeterminado'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data_fim}
                    onSelect={(date) => handleChange('data_fim', date)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Procuração</Label>
            <Select value={formData.tipo} onValueChange={(v) => handleChange('tipo', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Simples">Simples</SelectItem>
                <SelectItem value="Com Certificado Digital">Com Certificado Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
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
                procuracao ? 'Atualizar' : 'Criar Procuração'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}