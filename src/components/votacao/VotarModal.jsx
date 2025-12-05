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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Vote, Lock, Scale, Hand } from "lucide-react";

export default function VotarModal({ open, onOpenChange, votacao, membroId, pesoVoto = 1, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isAbstencao, setIsAbstencao] = useState(false);

  useEffect(() => {
    setSelectedOption('');
    setSelectedOptions([]);
    setIsAbstencao(false);
  }, [votacao, open]);

  const handleMultipleChoice = (option, checked) => {
    if (checked) {
      setSelectedOptions(prev => [...prev, option]);
    } else {
      setSelectedOptions(prev => prev.filter(o => o !== option));
    }
    setIsAbstencao(false);
  };

  const handleAbstencao = () => {
    setIsAbstencao(true);
    setSelectedOption('');
    setSelectedOptions([]);
  };

  const handleSubmit = async () => {
    if (!isAbstencao) {
      if (votacao.tipo_voto === 'Escolha Única' && !selectedOption) {
        toast.error('Selecione uma opção');
        return;
      }
      if (votacao.tipo_voto === 'Múltipla Escolha' && selectedOptions.length === 0) {
        toast.error('Selecione pelo menos uma opção');
        return;
      }
    }

    setIsLoading(true);
    try {
      const votoData = {
        votacao_id: votacao.id,
        membro_id: membroId,
        abstencao: isAbstencao,
        peso_voto: votacao.voto_qualificado ? pesoVoto : 1
      };

      if (!isAbstencao) {
        if (votacao.tipo_voto === 'Escolha Única') {
          votoData.opcao_escolhida = selectedOption;
        } else {
          votoData.opcoes_escolhidas = selectedOptions;
        }
      }

      // For secret vote, generate a hash
      if (votacao.voto_secreto) {
        votoData.hash_voto = crypto.randomUUID();
      }

      await base44.entities.Voto.create(votoData);
      toast.success('Voto registrado com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Erro ao registrar voto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!votacao) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-blue-600" />
            Votar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">{votacao.titulo}</h3>
            {votacao.descricao && (
              <p className="text-sm text-gray-600 mt-1">{votacao.descricao}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {votacao.voto_secreto && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Voto Secreto
              </Badge>
            )}
            {votacao.voto_qualificado && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Scale className="w-3 h-3" />
                Peso: {pesoVoto}
              </Badge>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">
              {votacao.tipo_voto === 'Escolha Única' 
                ? 'Selecione uma opção:' 
                : 'Selecione uma ou mais opções:'}
            </p>

            {votacao.tipo_voto === 'Escolha Única' ? (
              <RadioGroup 
                value={selectedOption} 
                onValueChange={(v) => { setSelectedOption(v); setIsAbstencao(false); }}
                className="space-y-2"
              >
                {votacao.opcoes?.map((opcao, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem value={opcao} id={`opt-${index}`} />
                    <Label htmlFor={`opt-${index}`} className="flex-1 cursor-pointer">
                      {opcao}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                {votacao.opcoes?.map((opcao, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                    <Checkbox
                      id={`opt-${index}`}
                      checked={selectedOptions.includes(opcao)}
                      onCheckedChange={(checked) => handleMultipleChoice(opcao, checked)}
                    />
                    <Label htmlFor={`opt-${index}`} className="flex-1 cursor-pointer">
                      {opcao}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {votacao.permite_abstencao && (
              <Button
                type="button"
                variant={isAbstencao ? "default" : "outline"}
                className={`w-full mt-4 ${isAbstencao ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
                onClick={handleAbstencao}
              >
                <Hand className="w-4 h-4 mr-2" />
                Abster-me
              </Button>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || (!isAbstencao && !selectedOption && selectedOptions.length === 0)} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Votando...
                </>
              ) : (
                'Confirmar Voto'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}