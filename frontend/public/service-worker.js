/**
 * 🔔 BrandFlow Service Worker: Enterprise Web Push & Lock Screen Dispatcher
 * Handles incoming push events, native sound/vibration triggers, and window focus
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Handle incoming push notifications sent from backend BullMQ worker
 */
self.addEventListener('push', (event) => {
  let rawData = {};
  if (event.data) {
    try {
      rawData = event.data.json();
    } catch (e) {
      rawData = {
        title: 'BrandFlow Alert 🔔',
        body: event.data.text(),
      };
    }
  }

  // Support both flat format and nested { notification: { title, body } } format
  const notificationPayload = rawData.notification || rawData;
  const title = notificationPayload.title || rawData.title || 'BrandFlow Festival Alert 🎆';
  const body = notificationPayload.body || rawData.body || 'A new creative design is waiting for your business!';
  const linkUrl =
    notificationPayload.data?.url ||
    rawData.data?.url ||
    notificationPayload.url ||
    rawData.url ||
    rawData.linkUrl ||
    '/studio';

  // Construct standard Notification options
  const options = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: linkUrl,
      timestamp: Date.now(),
    },
    // Use dynamic tag or renotify: true so subsequent notifications ALWAYS trigger OS sound and banner
    tag: rawData.tag ? `${rawData.tag}-${Date.now()}` : `brandflow-${Date.now()}`,
    renotify: true,
    silent: false, // Explicitly tell OS to play notification sound
    requireInteraction: true,
  };

  // Only assign image if it is a non-empty string URL (avoid passing null which crashes WebKit)
  const candidateImage = notificationPayload.image || rawData.image || rawData.imageUrl;
  if (candidateImage && typeof candidateImage === 'string' && candidateImage.trim().length > 0) {
    options.image = candidateImage.trim();
  }

  // Vibration pattern: [vibrate, pause, vibrate, pause, vibrate]
  options.vibrate = [250, 100, 250, 100, 250];

  // Try adding action buttons where supported (Chrome desktop/Android)
  if (Array.isArray(rawData.actions) && rawData.actions.length > 0) {
    options.actions = rawData.actions;
  } else {
    options.actions = [
      { action: 'open-link', title: '🎨 Open Studio' },
      { action: 'dismiss', title: 'Dismiss' },
    ];
  }

  // 1. Notify any active/open BrandFlow tabs so they can play sound & update UI in real-time
  const notifyClientsPromise = self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((clients) => {
      for (const client of clients) {
        client.postMessage({
          type: 'BRANDFLOW_PUSH_RECEIVED',
          payload: {
            title,
            body,
            linkUrl,
            timestamp: Date.now(),
          },
        });
      }
    })
    .catch(() => {});

  // 2. Dispatch native OS notification (with fallback for Safari/strict engines)
  const showNotificationPromise = self.registration
    .showNotification(title, options)
    .catch((err) => {
      console.warn('[SW] Rich notification failed, falling back to minimal options:', err);
      // Minimal safe options without actions/image for Safari or restricted platforms
      return self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: { url: linkUrl },
        tag: `fallback-${Date.now()}`,
        renotify: true,
        silent: false,
      });
    });

  event.waitUntil(Promise.all([showNotificationPromise, notifyClientsPromise]));
});

/**
 * Handle user tapping or clicking on notification banner
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/studio';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If BrandFlow tab is already open, focus it and navigate
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise, open a new window/tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
