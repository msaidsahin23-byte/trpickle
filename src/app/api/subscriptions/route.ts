import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Try to use service role if available for bypassing RLS in API, otherwise fallback to anon
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey

const supabase = createClient(supabaseUrl, serviceKey)

export async function POST(req: Request) {
  try {
    const { userId, subscription } = await req.json()

    if (!userId || !subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Missing userId or subscription' }, { status: 400 })
    }

    const { endpoint, keys } = subscription

    if (!keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: 'Missing subscription keys' }, { status: 400 })
    }

    // Upsert subscription in Supabase
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: String(userId),
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        updated_at: new Date().toISOString()
      }, { onConflict: 'endpoint' }) // Assuming 'endpoint' is unique constraint in db

    if (error) {
      console.error('Supabase upsert error:', error)
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Subscription saved' })
  } catch (error) {
    console.error('Error in /api/subscriptions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
