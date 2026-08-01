import { motion } from 'framer-motion';
import WeatherIcon from './WeatherIcon';
import { describeCode } from '../lib/weatherApi';

export default function HourlyStrip({ hourly }) {
  if (!hourly) return null;

  // Show the next 24 hours starting from now
  const nowIndex = hourly.time.findIndex((t) => new Date(t) >= new Date(Date.now() - 30 * 60000));
  const start = Math.max(nowIndex, 0);
  const items = hourly.time.slice(start, start + 24).map((t, i) => ({
    time: new Date(t),
    temp: hourly.temperature_2m[start + i],
    code: hourly.weather_code[start + i],
    pop: hourly.precipitation_probability?.[start + i],
  }));

  return (
    <div className="glass rounded-3xl px-5 py-5 w-full max-w-md">
      <p className="text-xs uppercase tracking-wide text-[#EDEEF7]/40 mb-3 px-1">Next 24 hours</p>
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">
        {items.map((it, i) => {
          const { condition } = describeCode(it.code);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
              className="flex flex-col items-center gap-1.5 min-w-[52px]"
            >
              <span className="text-xs text-[#EDEEF7]/50 tabular">
                {i === 0 ? 'Now' : it.time.toLocaleTimeString([], { hour: 'numeric' })}
              </span>
              <WeatherIcon condition={condition} isDay={it.time.getHours() >= 6 && it.time.getHours() < 19} size={30} />
              <span className="text-sm font-medium tabular">{Math.round(it.temp)}°</span>
              {it.pop != null && it.pop > 0 && (
                <span className="text-[10px] text-[#7FE7C4]/80 tabular">{it.pop}%</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
