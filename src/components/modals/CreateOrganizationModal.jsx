import React, { useState } from 'react';
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
import { Building2, Loader2 } from "lucide-react";

const TIPOS_ORGANIZACAO = [
  'Condomínio',
  'Igreja',
  'Empresa',
  'Associação',
  'Cooperativa',
  'Sindicato',
  'Escola/Instituição Educacional',
  'Clube/Sociedade Recreativa',
  'Outro'
];

export default function CreateOrganizationModal({ 
  open, 
  onOpenChange, 
  selectedPlan, 
  onSubmit, 
  isLoading 
}) {
  const [formData, setFormData] = useState({
    nome: '',
    tipo_organizacao: '',
    cnpj_cpf: '',
    telefone: '',
    endereco: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.tipo_organizacao) newErrors.tipo_organizacao = 'Tipo é obrigatório';
    if (!formData.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const isFormValid = formData.nome.trim() && formData.tipo_organizacao && formData.endereco.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-smooth-fade sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Crie sua Organização</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar sua organização
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {selectedPlan && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Plano selecionado:</span> {selectedPlan.name} - R${selectedPlan.price}/mês
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ✨ Inclui 10 dias de teste grátis
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Organização *</Label>
            <Input
              id="nome"
              placeholder="Ex: Condomínio Parque Verde"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              className={errors.nome ? 'border-red-500' : ''}
            />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_organizacao">Tipo de Organização *</Label>
            <Select
              value={formData.tipo_organizacao}
              onValueChange={(value) => handleChange('tipo_organizacao', value)}
            >
              <SelectTrigger className={errors.tipo_organizacao ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="animate-slideDown">
                {TIPOS_ORGANIZACAO.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipo_organizacao && <p className="text-xs text-red-500">{errors.tipo_organizacao}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
              <Input
                id="cnpj_cpf"
                placeholder="00.000.000/0001-00"
                value={formData.cnpj_cpf}
                onChange={(e) => handleChange('cnpj_cpf', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo *</Label>
            <Input
              id="endereco"
              placeholder="Rua, número, bairro, cidade - UF"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              className={errors.endereco ? 'border-red-500' : ''}
            />
            {errors.endereco && <p className="text-xs text-red-500">{errors.endereco}</p>}
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
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Organização e Continuar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}