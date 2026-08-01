import { motion } from 'framer-motion';
import WeatherIcon from './WeatherIcon';
import { describeCode } from '../lib/weatherApi';

export default function DailyList({ daily }) {
  if (!daily) return null;

  const allTemps = [...daily.temperature_2m_max, ...daily.temperature_2m_min];
  const min = Math.min(...allTemps);
  const max = Math.max(...allTemps);
  const range = max - min || 1;

  return (
    <div className="glass rounded-3xl px-5 py-5 w-full max-w-md">
      <p className="text-xs uppercase tracking-wide text-[#EDEEF7]/40 mb-3 px-1">7-day forecast</p>
      <div className="flex flex-col divide-y divide-white/10">
        {daily.time.map((t, i) => {
          const { condition } = describeCode(daily.weather_code[i]);
          const day = new Date(t);
          const lo = daily.temperature_2m_min[i];
          const hi = daily.temperature_2m_max[i];
          const leftPct = ((lo - min) / range) * 100;
          const widthPct = ((hi - lo) / range) * 100;

          return (
            <motion.div
              key={t}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
              className="flex items-center gap-3 py-3"
            >
              <span className="w-10 text-sm text-[#EDEEF7]/70">
                {i === 0 ? 'Today' : day.toLocaleDateString([], { weekday: 'short' })}
              </span>
              <WeatherIcon condition={condition} isDay={true} size={26} />
              <span className="w-9 text-sm tabular text-[#EDEEF7]/50 text-right">{Math.round(lo)}°</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/10 relative overflow-hidden">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-[#3B5BDB] to-[#FF9F5B]"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                />
              </div>
              <span className="w-9 text-sm tabular text-right">{Math.round(hi)}°</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
