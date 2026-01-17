import { createClientFromRequest } from 'npm:@base44/sdk@0.8.18';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenant_id, assembleia_id, event_type } = await req.json();

    if (!tenant_id || !assembleia_id || !event_type) {
      return Response.json({ 
        error: 'Dados obrigatórios: tenant_id, assembleia_id, event_type' 
      }, { status: 400 });
    }

    if (!['new', 'updated', 'canceled'].includes(event_type)) {
      return Response.json({ 
        error: 'event_type deve ser: new, updated ou canceled' 
      }, { status: 400 });
    }

    const webhookUrl = Deno.env.get("N8N_ASSEMBLY_MANAGER_URL");
    if (!webhookUrl) {
      console.error('N8N_ASSEMBLY_MANAGER_URL não configurada');
      return Response.json({ 
        success: false,
        error: 'Webhook URL não configurada' 
      }, { status: 500 });
    }

    // Get tenant info
    const tenants = await base44.asServiceRole.entities.Tenant.filter({ id: tenant_id });
    if (tenants.length === 0) {
      return Response.json({ 
        error: 'Tenant não encontrado' 
      }, { status: 404 });
    }
    const tenant = tenants[0];

    // Get assembleia info
    const assembleias = await base44.asServiceRole.entities.Assembleia.filter({ id: assembleia_id });
    if (assembleias.length === 0) {
      return Response.json({ 
        error: 'Assembleia não encontrada' 
      }, { status: 404 });
    }
    const assembleia = assembleias[0];

    // Get all members from organization
    const members = await base44.asServiceRole.entities.Membro.filter({ 
      tenant_id: tenant_id,
      ativo: true
    });

    // Normalize telephone with +55
    const normalizeTelephone = (phone) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.startsWith('55') ? `+${cleaned}` : `+55${cleaned}`;
    };

    // Format date to Portuguese extended format
    const formatDateExtended = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    // Format time to 24h format
    const formatTime24h = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    // Prepare webhook payload
    const payload = {
      event: event_type,
      organization_id: tenant.id,
      organization_name: tenant.nome,
      assembly_id: assembleia.id,
      assembly_name: assembleia.nome,
      assembly_date: formatDateExtended(assembleia.data_hora_inicio),
      assembly_time: formatTime24h(assembleia.data_hora_inicio),
      assembly_local: assembleia.local || '',
      assembly_status: assembleia.status,
      members: members.map(m => ({
        id: m.id,
        name: m.nome_completo,
        email: m.email || '',
        telephone: normalizeTelephone(m.telefone),
        role: m.tipo_membro || 'Proprietário'
      }))
    };

    console.log(`Enviando webhook para ${webhookUrl} - Evento: ${event_type}`);

    // Send webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro no webhook:', response.status, errorText);
      return Response.json({ 
        success: false,
        error: 'Erro ao enviar webhook',
        details: errorText
      }, { status: response.status });
    }

    console.log('Webhook enviado com sucesso');

    return Response.json({ 
      success: true,
      message: 'Webhook enviado com sucesso',
      event: event_type,
      members_count: members.length
    });

  } catch (error) {
    console.error('Erro na função webhookAssembleiaManager:', error);
    return Response.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
});