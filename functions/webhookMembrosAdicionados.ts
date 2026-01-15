import { createClientFromRequest } from 'npm:@base44/sdk@0.8.18';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenant_id, members } = await req.json();

    if (!tenant_id || !members || !Array.isArray(members) || members.length === 0) {
      return Response.json({ 
        error: 'Dados obrigatórios: tenant_id, members (array)' 
      }, { status: 400 });
    }

    const webhookUrl = Deno.env.get("N8N_MEMBER_ADD_URL");
    if (!webhookUrl) {
      console.error('N8N_MEMBER_ADD_URL não configurada');
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

    // Prepare webhook payload
    const payload = {
      event: "members_added_batch",
      organization_id: tenant.id,
      organization_name: tenant.nome,
      members: members.map(m => ({
        id: m.id,
        name: m.nome_completo,
        email: m.email || '',
        telephone: m.telefone,
        role: m.tipo_membro || 'Proprietário'
      }))
    };

    console.log(`Enviando webhook para ${webhookUrl} com ${members.length} membro(s)`);

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
      members_count: members.length
    });

  } catch (error) {
    console.error('Erro na função webhookMembrosAdicionados:', error);
    return Response.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
});