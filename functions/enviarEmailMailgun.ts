import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, html, text } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return Response.json({ 
        error: 'Campos obrigatórios: to, subject, e (html ou text)' 
      }, { status: 400 });
    }

    const apiKey = Deno.env.get("MAILGUN_API_KEY");
    const domain = Deno.env.get("MAILGUN_DOMAIN");
    const fromEmail = Deno.env.get("MAILGUN_FROM_EMAIL");

    if (!apiKey || !domain || !fromEmail) {
      console.error('Configuração do Mailgun incompleta');
      return Response.json({ 
        error: 'Configuração do Mailgun incompleta. Verifique as variáveis de ambiente.' 
      }, { status: 500 });
    }

    console.log(`Enviando e-mail para: ${to}`);

    // Prepare form data for Mailgun API
    const formData = new FormData();
    formData.append('from', `VoteSecure <${fromEmail}>`);
    formData.append('to', to);
    formData.append('subject', subject);
    
    if (html) {
      formData.append('html', html);
    }
    if (text) {
      formData.append('text', text);
    }

    // Send email via Mailgun API
    const mailgunUrl = `https://api.mailgun.net/v3/${domain}/messages`;
    const response = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${apiKey}`)}`
      },
      body: formData
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Erro do Mailgun:', responseData);
      return Response.json({ 
        success: false,
        error: 'Erro ao enviar e-mail via Mailgun',
        details: responseData.message || 'Erro desconhecido'
      }, { status: response.status });
    }

    console.log('E-mail enviado com sucesso:', responseData);

    return Response.json({ 
      success: true,
      message: 'E-mail enviado com sucesso',
      mailgun_id: responseData.id
    });

  } catch (error) {
    console.error('Erro na função enviarEmailMailgun:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Erro interno do servidor' 
    }, { status: 500 });
  }
});