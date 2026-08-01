import { motion } from 'framer-motion';

export default function WeatherIcon({ condition = 'clear', isDay = true, size = 64 }) {
  const common = { width: size, height: size, viewBox: '0 0 100 100' };

  if (condition === 'clear') {
    return isDay ? (
      <svg {...common} aria-hidden="true">
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '50px', originY: '50px' }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x="48" y="4" width="4" height="14" rx="2"
              fill="#FFB870"
              transform={`rotate(${i * 45} 50 50)`}
            />
          ))}
        </motion.g>
        <motion.circle
          cx="50" cy="50" r="20" fill="#FFC98A"
          animate={{ r: [19, 21, 19] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    ) : (
      <svg {...common} aria-hidden="true">
        <motion.circle cx="46" cy="42" r="2" fill="#EDEEF7" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.circle cx="66" cy="30" r="1.5" fill="#EDEEF7" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2.5, repeat: Infinity }} />
        <motion.circle cx="30" cy="24" r="1.3" fill="#EDEEF7" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3.5, repeat: Infinity }} />
        <path d="M62 20 A22 22 0 1 0 62 64 A28 28 0 1 1 62 20Z" fill="#C9D6FF" />
      </svg>
    );
  }

  if (condition === 'cloudy') {
    return (
      <svg {...common} aria-hidden="true">
        <motion.g animate={{ x: [-2, 2, -2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <ellipse cx="40" cy="55" rx="24" ry="16" fill="#C7D1E0" opacity="0.9" />
          <ellipse cx="60" cy="48" rx="20" ry="18" fill="#EDEEF7" opacity="0.95" />
        </motion.g>
      </svg>
    );
  }

  if (condition === 'rain' || condition === 'storm') {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="50" cy="40" rx="26" ry="17" fill="#8891A3" />
        {[30, 45, 60, 75].map((x, i) => (
          <motion.line
            key={x}
            x1={x} y1="58" x2={x - 6} y2="76"
            stroke="#7FE7C4" strokeWidth="3" strokeLinecap="round"
            animate={{ y1: [58, 66], y2: [76, 84], opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeIn' }}
          />
        ))}
      </svg>
    );
  }

  if (condition === 'snow') {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="50" cy="38" rx="26" ry="16" fill="#CBD8EC" />
        {[32, 50, 68].map((x, i) => (
          <motion.circle
            key={x}
            cx={x} cy="60" r="2.5" fill="#F4F8FF"
            animate={{ y: [0, 20], opacity: [1, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3, ease: 'easeIn' }}
          />
        ))}
      </svg>
    );
  }

  if (condition === 'fog') {
    return (
      <svg {...common} aria-hidden="true">
        {[36, 48, 60].map((y, i) => (
          <motion.rect
            key={y}
            x="18" y={y} width="64" height="6" rx="3" fill="#C7D1E0"
            animate={{ x: [18, 24, 18] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </svg>
    );
  }

  return null;
}
