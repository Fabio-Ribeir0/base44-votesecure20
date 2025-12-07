import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { membro_email, membro_nome, tenant_nome, tenant_id } = await req.json();

    if (!membro_email || !membro_nome || !tenant_nome) {
      return Response.json({ 
        error: 'Dados obrigatórios: membro_email, membro_nome, tenant_nome' 
      }, { status: 400 });
    }

    console.log(`Verificando se ${membro_email} já é usuário do sistema...`);

    // Check if user already exists with this email
    const existingUsers = await base44.asServiceRole.entities.User.filter({ 
      email: membro_email.toLowerCase().trim()
    });

    if (existingUsers.length > 0) {
      console.log(`Usuário ${membro_email} já existe no sistema. Nenhum e-mail será enviado.`);
      return Response.json({ 
        message: 'Usuário já existe no sistema',
        user_exists: true 
      });
    }

    console.log(`Usuário ${membro_email} não existe. Enviando e-mail de boas-vindas...`);

    // Send welcome email with instructions
    const emailBody = `
Olá ${membro_nome},

Você foi cadastrado(a) como membro da organização "${tenant_nome}" no sistema VoteSecure de votações digitais.

Para participar das assembleias e votações, você precisa criar sua conta na plataforma. Siga os passos abaixo:

📋 PASSO A PASSO PARA CRIAR SUA CONTA:

1. Acesse: https://app.base44.com/apps/693235c07ff5429bea488677

2. Clique em "Criar Conta" ou "Sign Up"

3. IMPORTANTE: Use o seguinte e-mail para se cadastrar:
   ✉️ ${membro_email}

4. Crie uma senha segura

5. Preencha seu nome completo

6. Confirme seu e-mail (você receberá um link de confirmação)

7. Faça login e pronto! Você poderá participar das assembleias e votações


⚠️ ATENÇÃO IMPORTANTE:
- Você DEVE usar o e-mail ${membro_email} para criar sua conta
- Esse é o e-mail cadastrado na assembleia e é essencial para sua identificação no sistema
- Se você deseja usar um e-mail diferente, entre em contato com a organização "${tenant_nome}" para que eles atualizem seu cadastro


❓ PRECISA DE AJUDA?
Entre em contato com a organização "${tenant_nome}" responsável pela assembleia.


---
VoteSecure - Sistema de Votação Digital
Seguro, Transparente e Auditável
    `.trim();

    try {
      await base44.integrations.Core.SendEmail({
        from_name: 'VoteSecure',
        to: membro_email,
        subject: `Bem-vindo ao VoteSecure - ${tenant_nome}`,
        body: emailBody
      });

      console.log(`E-mail enviado com sucesso para ${membro_email}`);

      return Response.json({ 
        success: true,
        message: 'E-mail de boas-vindas enviado com sucesso',
        email_sent: true
      });

    } catch (emailError) {
      console.error('Erro ao enviar e-mail:', emailError);
      
      return Response.json({ 
        success: false,
        error: 'Erro ao enviar e-mail',
        details: emailError.message,
        email_sent: false
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro na função notificarNovoMembro:', error);
    return Response.json({ 
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
});