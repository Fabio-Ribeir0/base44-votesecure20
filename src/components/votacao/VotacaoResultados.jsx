import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Hand, Users, Lock, Scale } from "lucide-react";

export default function VotacaoResultados({ votacao, membros = [] }) {
  const [votos, setVotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVotos();
  }, [votacao?.id]);

  const loadVotos = async () => {
    if (!votacao?.id) return;
    try {
      const data = await base44.entities.Voto.filter({ votacao_id: votacao.id });
      setVotos(data);
    } catch (error) {
      console.error('Error loading votes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!votacao) return null;

  const calcularResultados = () => {
    const resultados = {};
    let totalVotos = 0;
    let abstencoes = 0;
    let totalPeso = 0;

    votacao.opcoes?.forEach(opcao => {
      resultados[opcao] = { count: 0, peso: 0 };
    });

    votos.forEach(voto => {
      const peso = voto.peso_voto || 1;
      totalPeso += peso;
      totalVotos++;

      if (voto.abstencao) {
        abstencoes++;
        return;
      }

      if (votacao.tipo_voto === 'Escolha Única' && voto.opcao_escolhida) {
        if (resultados[voto.opcao_escolhida]) {
          resultados[voto.opcao_escolhida].count++;
          resultados[voto.opcao_escolhida].peso += peso;
        }
      } else if (voto.opcoes_escolhidas) {
        voto.opcoes_escolhidas.forEach(opcao => {
          if (resultados[opcao]) {
            resultados[opcao].count++;
            resultados[opcao].peso += peso;
          }
        });
      }
    });

    return { resultados, totalVotos, abstencoes, totalPeso };
  };

  const { resultados, totalVotos, abstencoes, totalPeso } = calcularResultados();
  const votosEfetivos = totalVotos - abstencoes;
  const totalElegivel = membros.length;

  // Find winner (highest votes)
  let vencedor = null;
  let maxVotos = 0;
  Object.entries(resultados).forEach(([opcao, data]) => {
    const valor = votacao.voto_qualificado ? data.peso : data.count;
    if (valor > maxVotos) {
      maxVotos = valor;
      vencedor = opcao;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{votacao.titulo}</span>
          <Badge className={
            votacao.status === 'Encerrada' ? 'bg-gray-100 text-gray-700' :
            votacao.status === 'Aberta' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          }>
            {votacao.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 mx-auto text-gray-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{totalVotos}</p>
            <p className="text-xs text-gray-500">Votos</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Hand className="w-5 h-5 mx-auto text-gray-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{abstencoes}</p>
            <p className="text-xs text-gray-500">Abstenções</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 mx-auto text-gray-500 mb-1" />
            <p className="text-2xl font-bold text-gray-900">
              {totalElegivel > 0 ? Math.round((totalVotos / totalElegivel) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500">Participação</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          {votacao.voto_secreto && (
            <Badge variant="secondary"><Lock className="w-3 h-3 mr-1" />Secreto</Badge>
          )}
          {votacao.voto_qualificado && (
            <Badge variant="secondary"><Scale className="w-3 h-3 mr-1" />Qualificado</Badge>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {Object.entries(resultados).map(([opcao, data]) => {
            const valor = votacao.voto_qualificado ? data.peso : data.count;
            const total = votacao.voto_qualificado ? totalPeso : votosEfetivos;
            const percentage = total > 0 ? (valor / total) * 100 : 0;
            const isWinner = votacao.status === 'Encerrada' && opcao === vencedor && maxVotos > 0;

            return (
              <div key={opcao} className={`p-3 rounded-lg border ${isWinner ? 'border-green-300 bg-green-50' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {isWinner && <CheckCircle className="w-4 h-4 text-green-600" />}
                    <span className={`font-medium ${isWinner ? 'text-green-700' : 'text-gray-900'}`}>
                      {opcao}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {votacao.voto_qualificado 
                      ? `${data.peso.toFixed(1)} pts (${data.count} votos)`
                      : `${data.count} votos`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={percentage} className="flex-1" />
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {votacao.status === 'Encerrada' && vencedor && maxVotos > 0 && (
          <div className="p-4 bg-green-100 rounded-lg text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-800">Opção vencedora: {vencedor}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}