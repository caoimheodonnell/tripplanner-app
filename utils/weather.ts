// shape of weather data thats returned
export type WeatherData = {
  temp: number;
  description: string;
  city: string;
  country: string;
};

// fetch current weather for a city
export async function fetchWeather(city: string): Promise<WeatherData> {
  // get API key
  const key = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(city)}`;

  const res = await fetch(url);
  // manage failed request
  if (!res.ok) throw new Error('City not found');

  const data = await res.json();
  // return only the data neede
  return {
    temp:        Math.round(data.current.temp_c),
    description: data.current.condition.text,
    city:        data.location.name,
    country:     data.location.country,
  };
}