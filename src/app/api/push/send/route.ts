import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey
const supabase = createClient(supabaseUrl, serviceKey)

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:test@trpickle.com',
    vapidPublicKey,
    vapidPrivateKey
  )
} else {
  console.warn('VAPID keys are missing. Web push will not work.')
}

export async function POST(req: Request) {
  try {
    const { userId, title, body, icon, url } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: 'Push notifications are not configured on the server' }, { status: 501 })
    }

    // Fetch all push subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', String(userId))

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscriptions found for user' })
    }

    const payload = JSON.stringify({
      title: title || 'TRPickle',
      body: body || 'Yeni bir bildiriminiz var.',
      icon: icon || '/icon-192x192.png',
      url: url || '/'
    })

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh
        }
      }

      try {
        await webpush.sendNotification(pushSubscription, payload)
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription has expired or is no longer valid, delete it
          console.log('Subscription expired. Deleting endpoint:', sub.endpoint)
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        } else {
          console.error('Error sending push notification:', err)
        }
      }
    })

    await Promise.all(sendPromises)

    return NextResponse.json({ success: true, message: 'Push notifications processed' })
  } catch (error) {
    console.error('Error in /api/push/send:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
