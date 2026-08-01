import { useCallback, useEffect, useState } from 'react';

// Replace with your own VAPID public key generated on the backend
// (see server/README.md — `npx web-push generate-vapid-keys`).
const VAPID_PUBLIC_KEY = 'REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [registration, setRegistration] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      setSupported(false);
      return;
    }
    navigator.serviceWorker
      .register('/sw.js')
      .then(async (reg) => {
        setRegistration(reg);
        const existing = await reg.pushManager.getSubscription();
        setSubscribed(!!existing);
      })
      .catch((e) => setError(e.message));
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!registration) return;
    try {
      const perm = permission === 'granted' ? permission : await requestPermission();
      if (perm !== 'granted') return;

      // If a real VAPID key hasn't been configured, skip the actual push
      // subscription but still let local/demo notifications work.
      if (VAPID_PUBLIC_KEY.startsWith('REPLACE_')) {
        setSubscribed(true);
        return;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send the subscription to your backend to persist it.
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      }).catch(() => {
        /* backend optional for local demo */
      });

      setSubscribed(true);
    } catch (e) {
      setError(e.message);
    }
  }, [registration, permission, requestPermission]);

  const sendLocalNotification = useCallback((title, body, tag) => {
    if (!registration) return;
    registration.active?.postMessage({
      type: 'SHOW_LOCAL_NOTIFICATION',
      payload: { title, body, tag },
    });
  }, [registration]);

  return {
    supported,
    permission,
    subscribed,
    error,
    requestPermission,
    subscribe,
    sendLocalNotification,
  };
}
