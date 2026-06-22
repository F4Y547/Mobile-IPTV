import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const ENCRYPTION_SECRET = Deno.env.get('ENCRYPTION_SECRET') || '';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing stripe signature' }), { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan || 'premium';

        if (!userId) {
          console.error('No user_id in session metadata');
          break;
        }

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await supabase.from('subscriptions').insert({
          user_id: userId,
          plan_name: plan,
          status: 'active',
          payment_provider: 'stripe',
          payment_id: session.id,
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        });

        await supabase.from('user_profiles').update({
          subscription_status: 'active',
          subscription_plan: plan,
          subscription_expires_at: expiresAt.toISOString(),
        }).eq('user_id', userId);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;

        if (!subId) break;

        const subscription = await stripe.subscriptions.retrieve(subId);
        const userId = subscription.metadata?.user_id;
        const plan = subscription.metadata?.plan || 'premium';

        if (!userId) break;

        const expiresAt = new Date(subscription.current_period_end * 1000);

        await supabase.from('subscriptions').update({
          status: 'active',
          expires_at: expiresAt.toISOString(),
          payment_id: invoice.id,
        }).eq('payment_id', subId);

        await supabase.from('user_profiles').update({
          subscription_status: 'active',
          subscription_expires_at: expiresAt.toISOString(),
        }).eq('user_id', userId);

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;

        if (!userId) break;

        const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : 'expired';
        const expiresAt = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;

        await supabase.from('subscriptions').update({
          status: status === 'active' ? 'active' : 'expired',
          expires_at: expiresAt,
        }).eq('payment_id', sub.id);

        await supabase.from('user_profiles').update({
          subscription_status: status,
          subscription_expires_at: expiresAt,
        }).eq('user_id', userId);

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('stripe-webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500 },
    );
  }
});
