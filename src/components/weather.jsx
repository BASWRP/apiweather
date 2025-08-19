import { useEffect, useState } from "react";
import { CreateInput } from "thai-address-autocomplete-react";

const InputThaiAddress = CreateInput();
const WeatherSearch = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchByCoordinates(latitude, longitude);
      },
      (err) => {
        console.error("ไม่สามารถใช้ GPS ได้:", err.message);
        setError("ไม่สามารถใช้ตำแหน่งอัตโนมัติได้");
      }
    );
  }, []);

  const fetchByCoordinates = async (lat, lon) => {
    setLoading(true);
    setError("");
    setWeatherData(null);
    setForecastData(null);

    try {
      const resCurrent = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=th&appid=${API_KEY}`
      );
      const dataCurrent = await resCurrent.json();

      if (dataCurrent.cod !== 200)
        throw new Error(dataCurrent.message || "ไม่พบข้อมูลตำแหน่งนี้");

      setWeatherData(dataCurrent);
      setCity(dataCurrent.name);

      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=th&appid=${API_KEY}`
      );
      const dataForecast = await resForecast.json();

      if (dataForecast.cod !== "200")
        throw new Error(dataForecast.message || "ไม่พบข้อมูลพยากรณ์");

      setForecastData(dataForecast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("กรุณากรอกชื่อเมือง");
      return;
    }

    setLoading(true);
    setError("");
    setWeatherData(null);
    setForecastData(null);

    try {
      const resCurrent = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&units=metric&lang=th&appid=${API_KEY}`
      );
      const dataCurrent = await resCurrent.json();

      if (dataCurrent.cod !== 200)
        throw new Error(dataCurrent.message || "ไม่พบข้อมูลเมืองนี้");

      setWeatherData(dataCurrent);
      const resForecast = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          city
        )}&units=metric&lang=th&appid=${API_KEY}`
      );
      const dataForecast = await resForecast.json();

      if (dataForecast.cod !== "200")
        throw new Error(dataForecast.message || "ไม่พบข้อมูลพยากรณ์");

      setForecastData(dataForecast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dt_txt) => {
    const date = new Date(dt_txt);
    return date.toLocaleString("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white/90 rounded-xl shadow-lg">
      <div className="flex gap-4 items-center">
        <InputThaiAddress.Province
          className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={city}
          onChange={setCity}
          onSelect={(value) => {
            setCity(value);
            handleSearch();
          }}
          placeholder="เลือกจังหวัด"
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          {loading ? "🔎 กำลังค้น..." : "ค้นหา"}
        </button>
      </div>

      {error && <p className="text-red-600 font-medium">{error}</p>}

      {weatherData && (
        <div className="bg-white border rounded-xl shadow p-6 space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {weatherData.name}
          </h2>
          <p>
            🌡 <strong>อุณหภูมิ:</strong> {Math.round(weatherData.main.temp)}°C
          </p>
          <p>
            ☁️ <strong>สภาพ:</strong> {weatherData.weather[0].description}
          </p>
          <p>
            💧 <strong>ความชื้น:</strong> {weatherData.main.humidity}%
          </p>
          <p>
            💨 <strong>ลม:</strong> {weatherData.wind.speed} m/s
          </p>
        </div>
      )}

      {forecastData && (
        <div className="bg-white border rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            พยากรณ์อากาศล่วงหน้า
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto">
            {forecastData.list.slice(0, 12).map((item) => (
              <div
                key={item.dt}
                className="bg-gray-50 rounded-lg shadow-inner p-4 space-y-2 hover:bg-gray-100 transition"
              >
                <p className="text-sm text-gray-600">
                  {formatDateTime(item.dt_txt)}
                </p>
                <div className="flex items-center gap-2">
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt={item.weather[0].description}
                    className="w-10 h-10"
                  />
                  <p className="text-base font-medium text-gray-800">
                    {item.weather[0].description}
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  🌡 {Math.round(item.main.temp_max)}° /{" "}
                  {Math.round(item.main.temp_min)}°
                </p>
                <p className="text-sm text-gray-700">
                  💧 {item.main.humidity}% | 💨 {item.wind.speed} m/s
                </p>
                <p className="text-sm text-blue-700">
                  🌧 ความน่าจะเป็นฝน: {item.pop ? Math.round(item.pop * 100) : 0}
                  %
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherSearch;
