import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, XCircle, Loader2, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ImportCSVModal({ open, onOpenChange, tenantId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV');
        return;
      }
      setFile(selectedFile);
      setResults(null);
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        // Map CSV headers to field names
        if (header === 'nome' || header === 'nome_completo') row.nome_completo = value;
        else if (header === 'email') row.email = value;
        else if (header === 'telefone') row.telefone = value;
        else if (header === 'documento' || header === 'cpf') row.documento = value;
        else if (header === 'endereco') row.endereco = value;
        else if (header === 'tipo' || header === 'tipo_membro') row.tipo_membro = value || 'Proprietário';
        else if (header === 'peso' || header === 'peso_voto') row.peso_voto = parseInt(value) || 1;
      });

      if (row.nome_completo && row.telefone) {
        data.push(row);
      }
    }

    return data;
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    setResults(null);

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);

      if (parsedData.length === 0) {
        toast.error('Nenhum registro válido encontrado no arquivo');
        setIsLoading(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const member of parsedData) {
        try {
          await base44.entities.Membro.create({
            ...member,
            tenant_id: tenantId,
            ativo: true
          });
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`${member.nome_completo}: ${error.message}`);
        }
      }

      setResults({
        total: parsedData.length,
        success: successCount,
        errors: errorCount,
        errorDetails: errors
      });

      if (successCount > 0) {
        toast.success(`${successCount} membros importados com sucesso!`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} membros não puderam ser importados`);
      }

      if (successCount > 0) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Erro ao processar arquivo CSV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = 'nome_completo,email,telefone,documento,endereco,tipo_membro,peso_voto\nJoão Silva,joao@email.com,(11) 99999-9999,123.456.789-00,Rua A 123,Proprietário,1';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_membros.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setFile(null);
    setResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="modal-smooth-fade sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Importar Membros</DialogTitle>
              <DialogDescription>
                Importe membros através de um arquivo CSV
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <FileText className="w-4 h-4" />
            <AlertDescription>
              O arquivo deve conter as colunas: nome_completo, email, telefone, documento, endereco, tipo_membro, peso_voto.
              <br />
              <button 
                onClick={handleDownloadTemplate}
                className="text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Baixar modelo
              </button>
            </AlertDescription>
          </Alert>

          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div>
                <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">Clique para trocar</p>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Clique para selecionar</p>
                <p className="text-sm text-gray-500">ou arraste um arquivo CSV</p>
              </div>
            )}
          </div>

          {results && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700">{results.success} importados com sucesso</span>
              </div>
              {results.errors > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">{results.errors} com erro</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              {results ? 'Fechar' : 'Cancelar'}
            </Button>
            {!results && (
              <Button 
                onClick={handleImport}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  'Importar'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}