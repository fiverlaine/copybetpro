import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import webpush from "npm:web-push";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Configure VAPID details with default fallback keys
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") || "BNm-XyQ6x6oS2MLLOYYAh60MJRB6-Xd17qN_5y8uvYVVju0zieCJm3BCTo4XTCUgqO7nqZLQMF4MI-Xt4rORRvw";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") || "R4dHhoGnJurjY3q2W2SXEzj0fPeTI5YAOWfAYdYu17U";
const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "mailto:support@copybetpro.com";

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { title, body, url, targetUserId, targetTagColor, adminSecret } = await req.json();

    // 1. Verify admin permissions using RPC verify_admin_access
    if (!adminSecret) {
      return new Response(
        JSON.stringify({ error: 'Falta o segredo do admin' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { data: isValid, error: rpcError } = await supabaseClient.rpc('verify_admin_access', {
      p_secret: adminSecret
    });

    if (rpcError || !isValid) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado: Segredo de administrador inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // 2. Fetch subscriptions from public.push_subscriptions
    let query = supabaseClient.from('push_subscriptions').select('*, users(tag_color)');
    
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data: subscriptions, error } = await query;
    if (error) throw error;

    let filteredSubs = subscriptions || [];
    if (targetTagColor) {
      filteredSubs = filteredSubs.filter((sub: any) => sub.users?.tag_color === targetTagColor);
    }

    if (filteredSubs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhuma inscrição de notificações encontrada para os filtros especificados.', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 3. Send notifications
    const payload = JSON.stringify({
      title,
      body,
      url: url || '/dashboard',
    });

    const sendPromises = filteredSubs.map(async (sub: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        return { id: sub.id, success: true };
      } catch (err: any) {
        console.error(`Failed to send notification to ${sub.id}:`, err);
        // Clean up invalid or expired subscriptions (Status 410 or 404)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabaseClient.from('push_subscriptions').delete().eq('id', sub.id);
        }
        return { id: sub.id, success: false, error: err.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successfulCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({ message: `Sucesso: ${successfulCount} de ${results.length} notificações enviadas.`, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
