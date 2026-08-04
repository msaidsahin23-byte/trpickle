'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationManager() {
  const currentUser = useStore(state => state.currentUser)
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  useEffect(() => {
    if (isSupported && currentUser) {
      checkSubscription()
    }
  }, [isSupported, currentUser])

  async function registerServiceWorker() {
    try {
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  }

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      
      // If we have a subscription, make sure it's synced with the backend
      // for the currently logged in user
      if (sub && currentUser) {
        await sendSubscriptionToServer(sub)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  async function sendSubscriptionToServer(sub: PushSubscription) {
    if (!currentUser) return
    
    try {
      await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          subscription: sub,
        }),
      })
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  async function subscribeToPush() {
    try {
      // First ask for permission
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        alert('Bildirim izni reddedildi.')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      
      if (!vapidPublicKey) {
        console.error('VAPID public key not found')
        return
      }
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })
      
      setSubscription(sub)
      await sendSubscriptionToServer(sub)
      alert('Bildirimler başarıyla açıldı!')
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      alert('Bildirimlere abone olunurken bir hata oluştu.')
    }
  }

  if (!isSupported) {
    return null
  }

  if (!currentUser) {
    return null
  }

  // We only show the UI to enable notifications if they are not already subscribed
  // Alternatively, this can be moved to a settings page.
  // For now, if they are not subscribed, we can show a small prompt.
  if (!subscription) {
    return (
      <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-80 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl z-50 flex flex-col gap-3">
        <div className="text-sm font-bold">Uygulama Kapalıyken Bile Bildirim Alın</div>
        <div className="text-xs text-emerald-100">Maç isteklerini ve önemli mesajları anında görmek için bildirimlere izin verin.</div>
        <div className="flex gap-2">
          <button 
            onClick={subscribeToPush}
            className="flex-1 bg-white text-emerald-700 font-bold py-2 rounded-xl text-xs hover:bg-emerald-50 transition-colors"
          >
            İzin Ver
          </button>
          <button 
            onClick={() => setIsSupported(false)} // Temporarily hide it
            className="flex-1 bg-emerald-700 text-emerald-100 font-bold py-2 rounded-xl text-xs hover:bg-emerald-800 transition-colors"
          >
            Şimdi Değil
          </button>
        </div>
      </div>
    )
  }

  return null
}
