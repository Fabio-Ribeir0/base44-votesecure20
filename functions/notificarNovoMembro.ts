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

    // Prepare email content
    const emailText = `
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

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .steps { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .step { margin: 10px 0; padding-left: 10px; }
    .important { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
    .email-highlight { background: #e3f2fd; padding: 10px; border-radius: 4px; font-weight: bold; color: #1976D2; }
    .footer { text-align: center; padding: 20px; color: #757575; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🗳️ Bem-vindo ao VoteSecure</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${membro_nome}</strong>,</p>
      <p>Você foi cadastrado(a) como membro da organização <strong>"${tenant_nome}"</strong> no sistema VoteSecure de votações digitais.</p>
      <p>Para participar das assembleias e votações, você precisa criar sua conta na plataforma.</p>
      
      <div class="steps">
        <h3>📋 PASSO A PASSO PARA CRIAR SUA CONTA:</h3>
        <div class="step">1. Acesse: <a href="https://app.base44.com/apps/693235c07ff5429bea488677">https://app.base44.com/apps/693235c07ff5429bea488677</a></div>
        <div class="step">2. Clique em "Criar Conta" ou "Sign Up"</div>
        <div class="step">3. <strong>IMPORTANTE:</strong> Use o seguinte e-mail para se cadastrar:</div>
        <div class="email-highlight">✉️ ${membro_email}</div>
        <div class="step">4. Crie uma senha segura</div>
        <div class="step">5. Preencha seu nome completo</div>
        <div class="step">6. Confirme seu e-mail (você receberá um link de confirmação)</div>
        <div class="step">7. Faça login e pronto! Você poderá participar das assembleias e votações</div>
      </div>

      <div class="important">
        <h4>⚠️ ATENÇÃO IMPORTANTE:</h4>
        <ul>
          <li>Você <strong>DEVE</strong> usar o e-mail <strong>${membro_email}</strong> para criar sua conta</li>
          <li>Esse é o e-mail cadastrado na assembleia e é essencial para sua identificação no sistema</li>
          <li>Se você deseja usar um e-mail diferente, entre em contato com a organização "${tenant_nome}" para que eles atualizem seu cadastro</li>
        </ul>
      </div>

      <p>❓ <strong>PRECISA DE AJUDA?</strong><br>
      Entre em contato com a organização "${tenant_nome}" responsável pela assembleia.</p>
    </div>
    <div class="footer">
      VoteSecure - Sistema de Votação Digital<br>
      Seguro, Transparente e Auditável
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      // Use Mailgun to send email
      const emailResult = await base44.functions.invoke('enviarEmailMailgun', {
        to: membro_email,
        subject: `Bem-vindo ao VoteSecure - ${tenant_nome}`,
        text: emailText,
        html: emailHtml
      });

      if (emailResult.data?.success) {
        console.log(`E-mail enviado com sucesso para ${membro_email}`);
        return Response.json({ 
          success: true,
          message: 'E-mail de boas-vindas enviado com sucesso',
          email_sent: true
        });
      } else {
        console.error('Erro ao enviar e-mail:', emailResult.data);
        return Response.json({ 
          success: false,
          error: 'Erro ao enviar e-mail',
          details: emailResult.data?.error || 'Erro desconhecido',
          email_sent: false
        }, { status: 500 });
      }

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