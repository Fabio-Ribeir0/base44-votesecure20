import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const PRICE_MAP = {
  'Básico': 'price_1Sa0HRQl8tMaegNcroBH6tF7',
  'Padrão': 'price_1Sa0HqQl8tMaegNcgEwz3CoK',
  'Avançado': 'price_1Sa0I8Ql8tMaegNcWquv4e8Z',
  'Empresarial': 'price_1Sa0ITQl8tMaegNclYHg46B8'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planName, tenantId } = await req.json();

    if (!planName || !PRICE_MAP[planName]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId;
    
    if (tenantId) {
      const tenants = await base44.entities.Tenant.filter({ id: tenantId });
      if (tenants.length > 0 && tenants[0].stripe_customer_id) {
        customerId = tenants[0].stripe_customer_id;
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          user_id: user.id,
          tenant_id: tenantId || ''
        }
      });
      customerId = customer.id;

      // Save customer ID to tenant
      if (tenantId) {
        await base44.asServiceRole.entities.Tenant.update(tenantId, {
          stripe_customer_id: customerId
        });
      }
    }

    const appHost = req.headers.get('origin') || 'https://app.base44.com';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_MAP[planName],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appHost}/PaymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appHost}/MinhaOrganizacao?canceled=true`,
      subscription_data: {
        trial_period_days: 10,
        metadata: {
          tenant_id: tenantId || '',
          plan_name: planName
        }
      },
      metadata: {
        tenant_id: tenantId || '',
        plan_name: planName
      }
    });

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});