import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Validate user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assembleia_id, email } = await req.json();

    if (!assembleia_id || !email) {
      return Response.json({ error: 'Missing assembleia_id or email' }, { status: 400 });
    }

    console.log(`Backend - Recebido: assembleia_id=${assembleia_id}, email=${email}`);

    // Get assembleia to find tenant_id (using service role to avoid restrictions)
    const assembleias = await base44.asServiceRole.entities.Assembleia.filter({ id: assembleia_id });
    
    if (assembleias.length === 0) {
      console.log('Backend - Assembleia não encontrada');
      return Response.json({ error: 'Assembleia not found' }, { status: 404 });
    }

    const assembleia = assembleias[0];
    console.log(`Backend - Assembleia encontrada. Tenant ID: ${assembleia.tenant_id}`);

    // Find member using service role to bypass tenant restrictions
    console.log(`Backend - Buscando membro com tenant_id=${assembleia.tenant_id} e email=${email}`);
    const membros = await base44.asServiceRole.entities.Membro.filter({
      tenant_id: assembleia.tenant_id,
      email: email
    });

    console.log(`Backend - Membros encontrados: ${membros.length}`);
    if (membros.length > 0) {
      console.log(`Backend - Membro: ${JSON.stringify(membros[0])}`);
    }

    if (membros.length === 0) {
      return Response.json({ member: null }, { status: 200 });
    }

    return Response.json({ member: membros[0] }, { status: 200 });

  } catch (error) {
    console.error('Error in getMemberForCheckin:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});