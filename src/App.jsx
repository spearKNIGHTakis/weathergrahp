import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SkyBackground from './components/SkyBackground';
import SearchBar from './components/SearchBar';
import CurrentCard from './components/CurrentCard';
import HourlyStrip from './components/HourlyStrip';
import DailyList from './components/DailyList';
import NotificationPanel from './components/NotificationPanel';
import { fetchForecast, describeCode } from './lib/weatherApi';
import { useNotifications } from './hooks/useNotifications';

const DEFAULT_PLACE = { name: 'Accra', admin1: 'Greater Accra', country: 'Ghana', latitude: 5.6037, longitude: -0.187 };

export default function App() {
  const [place, setPlace] = useState(DEFAULT_PLACE);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rainAlertEnabled, setRainAlertEnabled] = useState(false);
  const alertedRef = useRef(false);
  const { sendLocalNotification } = useNotifications();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchForecast(place.latitude, place.longitude)
      .then((data) => {
        if (!cancelled) setForecast(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [place]);

  // Threshold alert: if enabled, check the next few hours for rain and notify once.
  useEffect(() => {
    if (!rainAlertEnabled || !forecast?.hourly || alertedRef.current) return;
    const now = Date.now();
    const upcoming = forecast.hourly.time
      .map((t, i) => ({ t: new Date(t).getTime(), pop: forecast.hourly.precipitation_probability?.[i] ?? 0 }))
      .filter((h) => h.t >= now && h.t <= now + 3 * 60 * 60 * 1000);
    const willRain = upcoming.some((h) => h.pop >= 50);
    if (willRain) {
      sendLocalNotification(
        'Rain expected soon',
        `There's a good chance of rain in the next few hours in ${place.name}.`,
        'rain-alert'
      );
      alertedRef.current = true;
    }
  }, [rainAlertEnabled, forecast, place.name, sendLocalNotification]);

  useEffect(() => {
    alertedRef.current = false;
  }, [place]);

  const condition = forecast ? describeCode(forecast.current.weather_code).condition : 'clear';
  const isDay = forecast ? forecast.current.is_day === 1 : true;

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-10 gap-6">
      <SkyBackground condition={condition} isDay={isDay} />

      <header className="w-full max-w-md flex flex-col gap-4 items-start">
        <h1 className="font-display text-xl font-semibold tracking-tight">Weathergraph</h1>
        <SearchBar onSelectPlace={setPlace} />
      </header>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-3xl px-7 py-10 w-full max-w-md text-center text-sm text-[#EDEEF7]/50"
          >
            Loading forecast…
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-3xl px-7 py-10 w-full max-w-md text-center text-sm text-[#EDEEF7]/60"
          >
            Couldn't load the forecast right now. Try searching again.
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            <CurrentCard place={place} current={forecast.current} />
            <HourlyStrip hourly={forecast.hourly} />
            <DailyList daily={forecast.daily} />
            <NotificationPanel
              rainAlertEnabled={rainAlertEnabled}
              onRainAlertToggle={setRainAlertEnabled}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-[11px] text-[#EDEEF7]/30 mt-4">
        Weather data from Open-Meteo
      </footer>
    </div>
  );
}
