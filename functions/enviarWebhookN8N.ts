import { createClientFromRequest } from 'npm:@base44/sdk@0.8.18';

/**
 * Envia webhook para N8N com retry logic e backoff exponencial
 */
async function sendWebhookWithRetry(url, payload, maxRetries = 3) {
  const delays = [1000, 5000, 15000]; // 1s, 5s, 15s
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt + 1}/${maxRetries} - Enviando webhook:`, JSON.stringify(payload, null, 2));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      
      if (response.ok) {
        console.log(`✅ Webhook enviado com sucesso (tentativa ${attempt + 1}):`, response.status, responseText);
        return {
          success: true,
          status: response.status,
          response: responseText,
          attempt: attempt + 1
        };
      } else {
        console.error(`❌ Erro no webhook (tentativa ${attempt + 1}):`, response.status, responseText);
        
        // Se não for o último retry, aguarda antes de tentar novamente
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delays[attempt]));
          continue;
        }
        
        return {
          success: false,
          status: response.status,
          error: responseText,
          attempt: attempt + 1
        };
      }
    } catch (error) {
      console.error(`❌ Exceção no webhook (tentativa ${attempt + 1}):`, error.message);
      
      // Se não for o último retry, aguarda antes de tentar novamente
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        continue;
      }
      
      return {
        success: false,
        error: error.message,
        attempt: attempt + 1
      };
    }
  }
}

/**
 * Normaliza número de telefone com código do país
 */
function normalizeTelephone(phone) {
  if (!phone) return '';
  
  // Remove espaços, parênteses, traços
  let normalized = phone.replace(/[\s\(\)\-]/g, '');
  
  // Se já começa com +55, retorna como está
  if (normalized.startsWith('+55')) {
    return normalized;
  }
  
  // Se começa com 55 (sem +), adiciona o +
  if (normalized.startsWith('55') && normalized.length > 10) {
    return '+' + normalized;
  }
  
  // Caso contrário, adiciona +55 no início
  return '+55' + normalized;
}

/**
 * Valida e normaliza dados de membros
 */
function validateAndNormalizeMembers(members) {
  if (!Array.isArray(members)) {
    return [];
  }
  
  return members.map(m => ({
    id: m.id || '',
    name: m.nome_completo || '',
    email: m.email || '',
    telephone: normalizeTelephone(m.telefone),
    role: m.tipo_membro || 'Proprietário',
    url: m.url || ''
  }));
}

/**
 * Divide array em chunks
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      event, 
      tenant_id, 
      organization_name,
      assembleia_id, 
      assembly_name,
      assembly_datetime,
      assembly_local,
      assembly_status,
      members 
    } = await req.json();

    // Validações
    if (!event) {
      return Response.json({ error: 'Campo "event" obrigatório' }, { status: 400 });
    }

    if (!tenant_id) {
      return Response.json({ error: 'Campo "tenant_id" obrigatório' }, { status: 400 });
    }

    const webhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (!webhookUrl) {
      console.error('❌ N8N_WEBHOOK_URL não configurada');
      return Response.json({ 
        success: false,
        error: 'Webhook URL não configurada' 
      }, { status: 500 });
    }

    // Normaliza membros
    const normalizedMembers = validateAndNormalizeMembers(members || []);
    
    // Para importação CSV com muitos membros, dividir em lotes de 100
    const shouldBatch = event === 'members_added_batch' && normalizedMembers.length > 100;
    
    if (shouldBatch) {
      console.log(`📦 Enviando ${normalizedMembers.length} membros em lotes de 100`);
      const chunks = chunkArray(normalizedMembers, 100);
      const results = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const payload = {
          event,
          organization_id: tenant_id,
          organization_name: organization_name || '',
          assembly_id: assembleia_id || '',
          assembly_name: assembly_name || '',
          assembly_datetime: assembly_datetime || '',
          assembly_local: assembly_local || '',
          assembly_status: assembly_status || '',
          members: chunks[i],
          batch_info: {
            batch_number: i + 1,
            total_batches: chunks.length,
            members_in_batch: chunks[i].length
          }
        };
        
        const result = await sendWebhookWithRetry(webhookUrl, payload);
        results.push(result);
        
        // Pequeno delay entre lotes para não sobrecarregar o N8N
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const allSuccess = results.every(r => r.success);
      const duration = Date.now() - startTime;
      
      console.log(`📊 Resultado em lotes: ${results.filter(r => r.success).length}/${results.length} bem sucedidos em ${duration}ms`);
      
      return Response.json({
        success: allSuccess,
        batches: results.length,
        members_total: normalizedMembers.length,
        results,
        duration_ms: duration
      });
    }
    
    // Payload único
    const payload = {
      event,
      organization_id: tenant_id,
      organization_name: organization_name || '',
      assembly_id: assembleia_id || '',
      assembly_name: assembly_name || '',
      assembly_datetime: assembly_datetime || '',
      assembly_local: assembly_local || '',
      assembly_status: assembly_status || '',
      members: normalizedMembers
    };

    const result = await sendWebhookWithRetry(webhookUrl, payload);
    const duration = Date.now() - startTime;
    
    console.log(`⏱️ Webhook processado em ${duration}ms`);

    return Response.json({
      ...result,
      event,
      members_count: normalizedMembers.length,
      duration_ms: duration
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Erro na função enviarWebhookN8N (${duration}ms):`, error);
    return Response.json({ 
      success: false,
      error: error.message || 'Erro interno do servidor',
      duration_ms: duration
    }, { status: 500 });
  }
});