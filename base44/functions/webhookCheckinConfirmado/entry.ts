import { createClientFromRequest } from 'npm:@base44/sdk@0.8.18';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenant_id, assembleia_id, members } = await req.json();

    if (!tenant_id || !assembleia_id || !members || !Array.isArray(members) || members.length === 0) {
      return Response.json({ 
        error: 'Dados obrigatórios: tenant_id, assembleia_id, members (array)' 
      }, { status: 400 });
    }

    const webhookUrl = Deno.env.get("N8N_CHECKIN_MEMBERS_URL");
    if (!webhookUrl) {
      console.error('N8N_CHECKIN_MEMBERS_URL não configurada');
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

    // Normalize telephone with +55
    const normalizeTelephone = (phone) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.startsWith('55') ? `+${cleaned}` : `+55${cleaned}`;
    };

    // Generate magic link for voting
    const baseUrl = 'https://votesecure.minimind.com.br';
    const magicLink = `${baseUrl}/VotacaoMembro?assembleia_id=${assembleia.id}`;

    // Prepare webhook payload
    const payload = {
      event: "checkin_confirmed_batch",
      organization_id: tenant.id,
      organization_name: tenant.nome,
      assembly_id: assembleia.id,
      assembly_name: assembleia.nome,
      members: members.map(m => ({
        id: m.id,
        name: m.nome_completo,
        email: m.email || '',
        telephone: normalizeTelephone(m.telefone),
        role: m.tipo_membro || 'Proprietário',
        url: magicLink
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
    console.error('Erro na função webhookCheckinConfirmado:', error);
    return Response.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
});