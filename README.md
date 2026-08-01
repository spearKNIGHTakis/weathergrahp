# weathergrahp
weatherapp
# Weathergraph

An animated, glassmorphic weather forecast web app with push notifications.

## Features
- Live weather via [Open-Meteo](https://open-meteo.com/) (free, no API key)
- City search with autocomplete
- Animated "living sky" canvas background that morphs with conditions (clear, cloudy, rain, storm, snow, fog) and day/night
- Glassmorphic UI with Framer Motion micro-interactions
- Hourly (24h) and 7-day forecast
- Push notifications: local test alerts out of the box, plus a real server-push pipeline you can wire up

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL. Notifications and the animated background work immediately — no API key needed for weather data.

## Enabling real push notifications (server-sent, works even when the tab is closed)

By default, the app can show *local* notifications (triggered while the tab is open, e.g. the rain-alert toggle and the "send test alert" button). To get real push notifications sent from a server:

1. `cd server && npm install`
2. Generate VAPID keys: `npx web-push generate-vapid-keys`
3. Copy `.env.example` to `.env` and paste in the generated keys
4. `npm start` (runs the push server on port 4000)
5. Paste the **public** key into `VAPID_PUBLIC_KEY` in `src/hooks/useNotifications.js`
6. In the app, click "Turn on weather alerts" — this subscribes the browser and posts the subscription to `/api/subscribe`
7. Trigger a push manually to test: `curl -X POST http://localhost:4000/api/notify -H "Content-Type: application/json" -d '{"title":"Storm warning","body":"Heavy rain expected tonight."}'`

In production, replace the in-memory subscription store in `server/index.js` with a real database, and run a scheduled job (cron / queue worker) that checks each subscribed user's forecast and calls `/api/notify` when conditions cross a threshold.

## Tech
React + Vite, Tailwind v4, Framer Motion, native Canvas 2D for the sky background, Web Push API + a minimal Express/web-push backend.

## Deploying
Any static host works for the frontend (Vercel, Netlify). The `server/` folder is a separate small Node service — deploy it anywhere that can keep VAPID keys as secrets.
