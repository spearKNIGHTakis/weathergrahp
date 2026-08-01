import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geocodeCity } from '../lib/weatherApi';

export default function SearchBar({ onSelectPlace }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await geocodeCity(query.trim());
        setResults(r);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="glass rounded-2xl flex items-center gap-3 px-4 py-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="#EDEEF7" strokeOpacity="0.6" strokeWidth="2" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#EDEEF7" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search a city..."
          aria-label="Search for a city"
          className="bg-transparent outline-none flex-1 text-[15px] placeholder:text-[#EDEEF7]/40"
        />
        {loading && (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#7FE7C4]/30 border-t-[#7FE7C4] animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="glass-strong absolute mt-2 w-full rounded-2xl overflow-hidden z-20"
          >
            {results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => {
                    onSelectPlace(r);
                    setOpen(false);
                    setQuery('');
                    setResults([]);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-sm"
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="text-[#EDEEF7]/50">
                    {r.admin1 ? `, ${r.admin1}` : ''}{r.country ? `, ${r.country}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
