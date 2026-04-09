import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import WebPush from 'https://esm.sh/web-push@3.6.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Trata o preflight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Pega os dados enviados pelo ScoreModal
    const { title, body, url } = await req.json()

    // Busca todas as assinaturas ativas no banco
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_subscriptions')
      .select('subscription')

    if (subError) throw subError

    // Configura o VAPID com as chaves que a gente setou nos secrets
    WebPush.setVapidDetails(
      Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com',
      Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    )

    // Dispara para todo mundo em paralelo
    const notifications = subscriptions.map((sub: any) => {
      return WebPush.sendNotification(
        sub.subscription,
        JSON.stringify({ title, body, url })
      ).catch(async (err) => {
        console.error('Erro ao enviar push:', err)
        // Opcional: Se o erro for 410 (Gone), a assinatura expirou, você pode deletar do banco aqui
      })
    })

    await Promise.all(notifications)

    return new Response(JSON.stringify({ message: `Notificações enviadas para ${subscriptions.length} dispositivos!` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
