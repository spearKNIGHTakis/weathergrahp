import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationPanel({ onRainAlertToggle, rainAlertEnabled }) {
  const { supported, permission, subscribed, subscribe, sendLocalNotification } = useNotifications();
  const [sent, setSent] = useState(false);

  if (!supported) {
    return (
      <div className="glass rounded-3xl px-5 py-5 w-full max-w-md text-sm text-[#EDEEF7]/50">
        Push notifications aren't supported in this browser.
      </div>
    );
  }

  const handleEnable = async () => {
    await subscribe();
  };

  const handleTest = () => {
    sendLocalNotification('Weather check', 'This is a test alert from your forecast app.', 'test');
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <div className="glass rounded-3xl px-5 py-5 w-full max-w-md">
      <p className="text-xs uppercase tracking-wide text-[#EDEEF7]/40 mb-3">Alerts</p>

      {permission !== 'granted' || !subscribed ? (
        <button
          onClick={handleEnable}
          className="w-full rounded-xl bg-[#7FE7C4] text-[#070B1A] font-medium text-sm py-3 hover:brightness-95 transition"
        >
          Turn on weather alerts
        </button>
      ) : (
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm">
            <span>Notify me before rain</span>
            <Toggle checked={rainAlertEnabled} onChange={onRainAlertToggle} />
          </label>

          <button
            onClick={handleTest}
            className="w-full rounded-xl border border-white/15 text-sm py-2.5 hover:bg-white/5 transition"
          >
            {sent ? 'Sent ✓' : 'Send a test alert'}
          </button>
        </div>
      )}

      {permission === 'denied' && (
        <p className="text-xs text-[#EDEEF7]/40 mt-3">
          Notifications are blocked in your browser settings. Enable them for this site to receive alerts.
        </p>
      )}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full relative transition-colors ${checked ? 'bg-[#7FE7C4]' : 'bg-white/15'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 rounded-full bg-[#070B1A]"
        style={{ left: checked ? '18px' : '2px' }}
      />
    </button>
  );
}
