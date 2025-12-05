import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const tenantId = session.metadata?.tenant_id;
        const planName = session.metadata?.plan_name;

        if (tenantId) {
          await base44.asServiceRole.entities.Tenant.update(tenantId, {
            status: 'active',
            plano_ativo: planName,
            stripe_subscription_id: session.subscription
          });
          console.log(`Tenant ${tenantId} activated with plan ${planName}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const tenantId = subscription.metadata?.tenant_id;

        if (tenantId) {
          let status = 'active';
          if (subscription.status === 'past_due') status = 'past_due';
          if (subscription.status === 'canceled') status = 'canceled';
          if (subscription.status === 'trialing') status = 'trialing';

          await base44.asServiceRole.entities.Tenant.update(tenantId, {
            status: status
          });
          console.log(`Tenant ${tenantId} status updated to ${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const tenantId = subscription.metadata?.tenant_id;

        if (tenantId) {
          await base44.asServiceRole.entities.Tenant.update(tenantId, {
            status: 'canceled',
            stripe_subscription_id: null
          });
          console.log(`Tenant ${tenantId} subscription canceled`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const tenantId = subscription.metadata?.tenant_id;

          if (tenantId) {
            await base44.asServiceRole.entities.Tenant.update(tenantId, {
              status: 'past_due'
            });
            console.log(`Tenant ${tenantId} payment failed, status: past_due`);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const tenantId = subscription.metadata?.tenant_id;

          if (tenantId) {
            await base44.asServiceRole.entities.Tenant.update(tenantId, {
              status: 'active'
            });
            console.log(`Tenant ${tenantId} payment successful, status: active`);
          }
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});