// Service worker: receives push events from the backend and shows notifications,
// and also responds to messages from the page for local/demo notifications.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Weather update', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Weather update';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'weather-alert',
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});

// Allows the page to ask the SW to fire a local demo notification
// (used for "send test alert" and client-evaluated threshold alerts).
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_LOCAL_NOTIFICATION') {
    const { title, body, tag } = event.data.payload || {};
    self.registration.showNotification(title || 'Weather update', {
      body: body || '',
      icon: '/icon-192.png',
      tag: tag || 'local-alert',
      vibrate: [100, 50, 100],
    });
  }
});
