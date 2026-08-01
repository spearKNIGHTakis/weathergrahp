// Minimal push-notification backend for Weathergraph.
//
// Setup:
//   1. cd server && npm install
//   2. npx web-push generate-vapid-keys
//   3. Put the keys in a .env file (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)
//   4. Put the public key into src/hooks/useNotifications.js on the frontend
//   5. npm start
//
// In production, replace the in-memory `subscriptions` array with a real
// database table keyed by subscription endpoint.

import express from 'express';
import cors from 'cors';
import webpush from 'web-push';

const PORT = process.env.PORT || 4000;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:you@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for demo purposes only.
const subscriptions = new Map();

app.post('/api/subscribe', (req, res) => {
  const sub = req.body;
  if (!sub?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  subscriptions.set(sub.endpoint, sub);
  res.status(201).json({ ok: true });
});

app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions.delete(endpoint);
  res.json({ ok: true });
});

// Trigger a push to every subscribed client — call this from a cron job,
// or a weather-alert worker that polls a forecast API for severe conditions.
app.post('/api/notify', async (req, res) => {
  const { title, body, tag, url } = req.body;
  const payload = JSON.stringify({ title, body, tag, url });

  const results = await Promise.allSettled(
    [...subscriptions.values()].map((sub) => webpush.sendNotification(sub, payload))
  );

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const sub = [...subscriptions.values()][i];
      // Clean up subscriptions that are no longer valid (expired/unsubscribed).
      if (r.reason?.statusCode === 410 || r.reason?.statusCode === 404) {
        subscriptions.delete(sub.endpoint);
      }
    }
  });

  res.json({ sent: results.filter((r) => r.status === 'fulfilled').length });
});

app.listen(PORT, () => console.log(`Push server running on http://localhost:${PORT}`));
