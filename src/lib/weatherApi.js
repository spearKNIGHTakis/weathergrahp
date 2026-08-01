// Open-Meteo — free, no API key required.
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// WMO weather codes -> our internal condition buckets + labels
export const WEATHER_CODES = {
  0: { label: 'Clear sky', condition: 'clear' },
  1: { label: 'Mainly clear', condition: 'clear' },
  2: { label: 'Partly cloudy', condition: 'cloudy' },
  3: { label: 'Overcast', condition: 'cloudy' },
  45: { label: 'Fog', condition: 'fog' },
  48: { label: 'Depositing rime fog', condition: 'fog' },
  51: { label: 'Light drizzle', condition: 'rain' },
  53: { label: 'Drizzle', condition: 'rain' },
  55: { label: 'Dense drizzle', condition: 'rain' },
  56: { label: 'Freezing drizzle', condition: 'rain' },
  57: { label: 'Dense freezing drizzle', condition: 'rain' },
  61: { label: 'Slight rain', condition: 'rain' },
  63: { label: 'Rain', condition: 'rain' },
  65: { label: 'Heavy rain', condition: 'rain' },
  66: { label: 'Freezing rain', condition: 'rain' },
  67: { label: 'Heavy freezing rain', condition: 'rain' },
  71: { label: 'Slight snow', condition: 'snow' },
  73: { label: 'Snow', condition: 'snow' },
  75: { label: 'Heavy snow', condition: 'snow' },
  77: { label: 'Snow grains', condition: 'snow' },
  80: { label: 'Slight showers', condition: 'rain' },
  81: { label: 'Showers', condition: 'rain' },
  82: { label: 'Violent showers', condition: 'rain' },
  85: { label: 'Slight snow showers', condition: 'snow' },
  86: { label: 'Heavy snow showers', condition: 'snow' },
  95: { label: 'Thunderstorm', condition: 'storm' },
  96: { label: 'Thunderstorm, slight hail', condition: 'storm' },
  99: { label: 'Thunderstorm, heavy hail', condition: 'storm' },
};

export function describeCode(code) {
  return WEATHER_CODES[code] || { label: 'Unknown', condition: 'cloudy' };
}

export async function geocodeCity(query) {
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding request failed');
  const data = await res.json();
  return (data.results || []).map((r) => ({
    id: `${r.id}`,
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));
}

export async function reverseGeocode(lat, lon) {
  // Open-Meteo doesn't offer reverse geocoding, so we just label by coordinates.
  return { name: 'Current location', latitude: lat, longitude: lon };
}

export async function fetchForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day,uv_index',
    hourly: 'temperature_2m,weather_code,precipitation_probability,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
  });
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Forecast request failed');
  return res.json();
}
