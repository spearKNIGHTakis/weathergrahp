import { motion } from 'framer-motion';
import WeatherIcon from './WeatherIcon';
import AnimatedNumber from './AnimatedNumber';
import { describeCode } from '../lib/weatherApi';

export default function CurrentCard({ place, current }) {
  if (!current) return null;
  const { condition, label } = describeCode(current.weather_code);
  const isDay = current.is_day === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass rounded-3xl px-7 py-8 w-full max-w-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#EDEEF7]/60 mb-1">{place?.name}{place?.admin1 ? `, ${place.admin1}` : ''}</p>
          <div className="flex items-end gap-2">
            <span className="font-display text-7xl font-medium leading-none">
              <AnimatedNumber value={Math.round(current.temperature_2m)} />
              <span className="text-3xl align-top">°</span>
            </span>
          </div>
          <p className="text-[#EDEEF7]/70 mt-2 text-sm">{label}</p>
          <p className="text-[#EDEEF7]/40 mt-0.5 text-xs">
            Feels like {Math.round(current.apparent_temperature)}°
          </p>
        </div>
        <WeatherIcon condition={condition} isDay={isDay} size={72} />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
        <Stat label="Humidity" value={`${current.relative_humidity_2m}%`} />
        <Stat label="Wind" value={`${Math.round(current.wind_speed_10m)} km/h`} />
        <Stat label="UV index" value={`${Math.round(current.uv_index ?? 0)}`} />
      </div>
    </motion.div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-[#EDEEF7]/40">{label}</p>
      <p className="text-sm font-medium mt-0.5 tabular">{value}</p>
    </div>
  );
}
