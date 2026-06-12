import { supabase } from '../lib/supabaseClient';

const VAPID_PUBLIC_KEY = 'BNm-XyQ6x6oS2MLLOYYAh60MJRB6-Xd17qN_5y8uvYVVju0zieCJm3BCTo4XTCUgqO7nqZLQMF4MI-Xt4rORRvw';

// Helper to convert base64 to Uint8Array required by PushManager subscribe
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register the Service Worker in the browser
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registrado com escopo:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }
  return null;
}

/**
 * Check if the browser is currently subscribed to push notifications
 */
export async function getSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Erro ao verificar inscrição push:', error);
    return null;
  }
}

/**
 * Subscribe the user's browser to push notifications and store the registration in Supabase
 */
export async function subscribeToPush(userId: string | null): Promise<PushSubscription> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('As notificações push não são suportadas neste navegador.');
  }

  const registration = await navigator.serviceWorker.ready;
  
  // Verify permissions first
  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    throw new Error('Permissão para notificações foi negada pelo usuário.');
  }

  // Check existing subscription
  let subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
  }

  // Format subscription to save to database
  const subJSON = subscription.toJSON();
  if (!subJSON.endpoint || !subJSON.keys?.p256dh || !subJSON.keys?.auth) {
    throw new Error('Falha ao obter chaves da inscrição push.');
  }

  // Upsert subscription into Supabase table
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: userId || null,
      endpoint: subJSON.endpoint,
      p256dh: subJSON.keys.p256dh,
      auth: subJSON.keys.auth
    }, { onConflict: 'endpoint' });

  if (error) {
    throw error;
  }

  return subscription;
}

/**
 * Unsubscribe the user from push notifications and remove from Supabase
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      
      // Delete from Database first
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint);

      // Unsubscribe in browser
      return await subscription.unsubscribe();
    }
  } catch (error) {
    console.error('Erro ao cancelar subscrição push:', error);
  }
  return false;
}
