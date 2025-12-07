import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { membro_email, membro_nome, tenant_nome, tenant_id, assembleia_id } = await req.json();

    if (!membro_email || !membro_nome || !tenant_nome) {
      return Response.json({ 
        error: 'Dados obrigatórios: membro_email, membro_nome, tenant_nome' 
      }, { status: 400 });
    }

    // Get assembleia and QR code link if assembleia_id is provided
    let qrCodeLink = 'https://app.base44.com/apps/693235c07ff5429bea488677/dashboard';
    let assembleiaInfo = null;
    
    if (assembleia_id) {
      const assembleias = await base44.asServiceRole.entities.Assembleia.filter({ id: assembleia_id });
      if (assembleias.length > 0) {
        assembleiaInfo = assembleias[0];
        qrCodeLink = `https://app.base44.com/apps/693235c07ff5429bea488677/checkin?token=${assembleiaInfo.qr_code_checkin_token}`;
      }
    }

    console.log(`Verificando se ${membro_email} já é usuário do sistema...`);

    // Check if user already exists with this email
    const existingUsers = await base44.asServiceRole.entities.User.filter({ 
      email: membro_email.toLowerCase().trim()
    });

    if (existingUsers.length > 0) {
      console.log(`Usuário ${membro_email} já existe no sistema. Enviando e-mail com instruções de acesso...`);
      
      // Send email to existing user with voting instructions
      const existingUserText = assembleiaInfo 
        ? `Olá ${membro_nome},

Você foi adicionado(a) como membro da assembleia "${assembleiaInfo.nome}" da organização "${tenant_nome}".

Para fazer check-in e participar da votação, siga os passos abaixo:

📋 COMO PARTICIPAR:

1. Acesse o link de check-in:
   ${qrCodeLink}

2. Use o e-mail cadastrado para fazer login:
   ✉️ ${membro_email}

3. Após o check-in, você terá acesso às votações da assembleia

4. Vote nas propostas apresentadas


✅ Você já possui uma conta no VoteSecure, basta acessar o link acima com seu e-mail cadastrado.


❓ PRECISA DE AJUDA?
Entre em contato com a organização "${tenant_nome}".


⚠️ Não responda a este e-mail. Esta é uma mensagem automática.

---
VoteSecure - Sistema de Votação Digital
Seguro, Transparente e Auditável`
        : `Olá ${membro_nome},

Você foi adicionado(a) como membro da organização "${tenant_nome}" no sistema VoteSecure.

Para acessar o sistema e participar das assembleias, use o link abaixo:

🔗 Acesse: https://app.base44.com/apps/693235c07ff5429bea488677/dashboard

Use o e-mail cadastrado para fazer login:
✉️ ${membro_email}

Você já possui uma conta no VoteSecure, basta fazer login para acessar.


❓ PRECISA DE AJUDA?
Entre em contato com a organização "${tenant_nome}".


⚠️ Não responda a este e-mail. Esta é uma mensagem automática.

---
VoteSecure - Sistema de Votação Digital
Seguro, Transparente e Auditável`;

      const existingUserHtml = assembleiaInfo
        ? `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .btn { display: inline-block; background: #1976D2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .steps { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .step { margin: 10px 0; padding-left: 10px; }
    .email-highlight { background: #e3f2fd; padding: 10px; border-radius: 4px; font-weight: bold; color: #1976D2; }
    .success { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #757575; font-size: 12px; }
    .no-reply { background: #fff3e0; padding: 10px; border-radius: 4px; margin: 20px 0; text-align: center; color: #e65100; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🗳️ VoteSecure</h1>
      <p>Você foi adicionado à assembleia</p>
    </div>
    <div class="content">
      <p>Olá <strong>${membro_nome}</strong>,</p>
      <p>Você foi adicionado(a) como membro da assembleia <strong>"${assembleiaInfo.nome}"</strong> da organização <strong>"${tenant_nome}"</strong>.</p>
      
      <div class="success">
        <p>✅ <strong>Você já possui uma conta no VoteSecure!</strong></p>
        <p>Basta acessar o link abaixo com seu e-mail cadastrado para fazer check-in e participar.</p>
      </div>

      <div style="text-align: center;">
        <a href="${qrCodeLink}" class="btn">🔗 Acessar Check-in da Assembleia</a>
      </div>

      <div class="steps">
        <h3>📋 COMO PARTICIPAR:</h3>
        <div class="step">1. Clique no botão acima ou acesse: <a href="${qrCodeLink}">${qrCodeLink}</a></div>
        <div class="step">2. Use o e-mail cadastrado para fazer login:</div>
        <div class="email-highlight">✉️ ${membro_email}</div>
        <div class="step">3. Após o check-in, você terá acesso às votações da assembleia</div>
        <div class="step">4. Vote nas propostas apresentadas</div>
      </div>

      <p>❓ <strong>PRECISA DE AJUDA?</strong><br>
      Entre em contato com a organização "${tenant_nome}".</p>

      <div class="no-reply">
        ⚠️ Não responda a este e-mail. Esta é uma mensagem automática.
      </div>
    </div>
    <div class="footer">
      VoteSecure - Sistema de Votação Digital<br>
      Seguro, Transparente e Auditável
    </div>
  </div>
</body>
</html>`
        : `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .btn { display: inline-block; background: #1976D2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .success { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
    .email-highlight { background: #e3f2fd; padding: 10px; border-radius: 4px; font-weight: bold; color: #1976D2; }
    .footer { text-align: center; padding: 20px; color: #757575; font-size: 12px; }
    .no-reply { background: #fff3e0; padding: 10px; border-radius: 4px; margin: 20px 0; text-align: center; color: #e65100; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🗳️ VoteSecure</h1>
      <p>Você foi adicionado à organização</p>
    </div>
    <div class="content">
      <p>Olá <strong>${membro_nome}</strong>,</p>
      <p>Você foi adicionado(a) como membro da organização <strong>"${tenant_nome}"</strong> no sistema VoteSecure.</p>
      
      <div class="success">
        <p>✅ <strong>Você já possui uma conta no VoteSecure!</strong></p>
        <p>Basta fazer login para acessar o sistema.</p>
      </div>

      <div style="text-align: center;">
        <a href="https://app.base44.com/apps/693235c07ff5429bea488677/dashboard" class="btn">🔗 Acessar VoteSecure</a>
      </div>

      <div class="email-highlight" style="margin: 20px 0; text-align: center;">
        Use seu e-mail cadastrado: ${membro_email}
      </div>

      <p>❓ <strong>PRECISA DE AJUDA?</strong><br>
      Entre em contato com a organização "${tenant_nome}".</p>

      <div class="no-reply">
        ⚠️ Não responda a este e-mail. Esta é uma mensagem automática.
      </div>
    </div>
    <div class="footer">
      VoteSecure - Sistema de Votação Digital<br>
      Seguro, Transparente e Auditável
    </div>
  </div>
</body>
</html>`;

      try {
        const emailResult = await base44.functions.invoke('enviarEmailMailgun', {
          to: membro_email,
          subject: assembleiaInfo 
            ? `Você foi adicionado à assembleia - ${tenant_nome}` 
            : `Você foi adicionado à organização - ${tenant_nome}`,
          text: existingUserText,
          html: existingUserHtml
        });

        if (emailResult.data?.success) {
          console.log(`E-mail enviado com sucesso para usuário existente ${membro_email}`);
          return Response.json({ 
            success: true,
            message: 'E-mail enviado para usuário existente',
            email_sent: true,
            user_exists: true
          });
        } else {
          console.error('Erro ao enviar e-mail para usuário existente:', emailResult.data);
          return Response.json({ 
            success: false,
            error: 'Erro ao enviar e-mail',
            details: emailResult.data?.error || 'Erro desconhecido',
            email_sent: false,
            user_exists: true
          }, { status: 500 });
        }
      } catch (emailError) {
        console.error('Erro ao enviar e-mail para usuário existente:', emailError);
        return Response.json({ 
          success: false,
          error: 'Erro ao enviar e-mail',
          details: emailError.message,
          email_sent: false,
          user_exists: true
        }, { status: 500 });
      }
    }

    console.log(`Usuário ${membro_email} não existe. Enviando e-mail de boas-vindas...`);

    // Prepare email content for new users
    const signupLink = assembleiaInfo 
      ? qrCodeLink 
      : 'https://app.base44.com/apps/693235c07ff5429bea488677';

    const emailText = assembleiaInfo
      ? `Olá ${membro_nome},

Você foi cadastrado(a) como membro da assembleia "${assembleiaInfo.nome}" da organização "${tenant_nome}" no sistema VoteSecure de votações digitais.

Para participar das assembleias e votações, você precisa criar sua conta na plataforma. Siga os passos abaixo:

📋 PASSO A PASSO PARA CRIAR SUA CONTA E PARTICIPAR:

1. Acesse o link de check-in da assembleia:
   ${qrCodeLink}

2. Clique em "Criar Conta" ou "Sign Up"

3. IMPORTANTE: Use o seguinte e-mail para se cadastrar:
   ✉️ ${membro_email}

4. Crie uma senha segura

5. Preencha seu nome completo

6. Confirme seu e-mail (você receberá um link de confirmação)

7. Após criar sua conta, acesse novamente o link do passo 1 para fazer check-in e participar da assembleia


⚠️ ATENÇÃO IMPORTANTE:
- Você DEVE usar o e-mail ${membro_email} para criar sua conta
- Esse é o e-mail cadastrado na assembleia e é essencial para sua identificação no sistema
- Se você deseja usar um e-mail diferente, entre em contato com a organização "${tenant_nome}" para que eles atualizem seu cadastro


❓ PRECISA DE AJUDA?
Entre em contato com a organização "${tenant_nome}".


⚠️ Não responda a este e-mail. Esta é uma mensagem automática.

---
VoteSecure - Sistema de Votação Digital
Seguro, Transparente e Auditável`
      : `Olá ${membro_nome},

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
Entre em contato com a organização "${tenant_nome}".


⚠️ Não responda a este e-mail. Esta é uma mensagem automática.

---
VoteSecure - Sistema de Votação Digital
Seguro, Transparente e Auditável`;
    `.trim();

    const emailHtml = assembleiaInfo
      ? `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .btn { display: inline-block; background: #1976D2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .steps { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .step { margin: 10px 0; padding-left: 10px; }
    .important { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
    .email-highlight { background: #e3f2fd; padding: 10px; border-radius: 4px; font-weight: bold; color: #1976D2; }
    .footer { text-align: center; padding: 20px; color: #757575; font-size: 12px; }
    .no-reply { background: #fff3e0; padding: 10px; border-radius: 4px; margin: 20px 0; text-align: center; color: #e65100; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🗳️ Bem-vindo ao VoteSecure</h1>
      <p>Assembleia: ${assembleiaInfo.nome}</p>
    </div>
    <div class="content">
      <p>Olá <strong>${membro_nome}</strong>,</p>
      <p>Você foi cadastrado(a) como membro da assembleia <strong>"${assembleiaInfo.nome}"</strong> da organização <strong>"${tenant_nome}"</strong>.</p>
      <p>Para participar, você precisa criar sua conta e fazer check-in na assembleia.</p>
      
      <div style="text-align: center;">
        <a href="${qrCodeLink}" class="btn">🔗 Acessar Link da Assembleia</a>
      </div>

      <div class="steps">
        <h3>📋 PASSO A PASSO PARA CRIAR SUA CONTA E PARTICIPAR:</h3>
        <div class="step">1. Clique no botão acima ou acesse: <a href="${qrCodeLink}">${qrCodeLink}</a></div>
        <div class="step">2. Clique em "Criar Conta" ou "Sign Up"</div>
        <div class="step">3. <strong>IMPORTANTE:</strong> Use o seguinte e-mail para se cadastrar:</div>
        <div class="email-highlight">✉️ ${membro_email}</div>
        <div class="step">4. Crie uma senha segura</div>
        <div class="step">5. Preencha seu nome completo</div>
        <div class="step">6. Confirme seu e-mail (você receberá um link de confirmação)</div>
        <div class="step">7. Após criar sua conta, acesse novamente o link do passo 1 para fazer check-in e participar da assembleia</div>
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
      Entre em contato com a organização "${tenant_nome}".</p>

      <div class="no-reply">
        ⚠️ Não responda a este e-mail. Esta é uma mensagem automática.
      </div>
    </div>
    <div class="footer">
      VoteSecure - Sistema de Votação Digital<br>
      Seguro, Transparente e Auditável
    </div>
  </div>
</body>
</html>`
      : `<!DOCTYPE html>
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
    .no-reply { background: #fff3e0; padding: 10px; border-radius: 4px; margin: 20px 0; text-align: center; color: #e65100; font-weight: bold; }
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
      Entre em contato com a organização "${tenant_nome}".</p>

      <div class="no-reply">
        ⚠️ Não responda a este e-mail. Esta é uma mensagem automática.
      </div>
    </div>
    <div class="footer">
      VoteSecure - Sistema de Votação Digital<br>
      Seguro, Transparente e Auditável
    </div>
  </div>
</body>
</html>`;
    `.trim();

    try {
      // Use Mailgun to send email
      const emailResult = await base44.functions.invoke('enviarEmailMailgun', {
        to: membro_email,
        subject: assembleiaInfo 
          ? `Bem-vindo ao VoteSecure - Assembleia: ${assembleiaInfo.nome}` 
          : `Bem-vindo ao VoteSecure - ${tenant_nome}`,
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