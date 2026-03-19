import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = await req.json();

    if (!tenantId) {
      return Response.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const tenants = await base44.entities.Tenant.filter({ id: tenantId });
    if (tenants.length === 0) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const tenant = tenants[0];
    if (!tenant.stripe_customer_id) {
      return Response.json({ error: 'No subscription found' }, { status: 400 });
    }

    const appHost = req.headers.get('origin') || 'https://app.base44.com';

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${appHost}/MinhaOrganizacao`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});