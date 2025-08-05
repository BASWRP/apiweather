import axios from "axios";

const instance = axios.create({
  baseURL: "https://api.openweathermap.org/data/2.5/",
  params: {
    units: "metric",
    lang: "th",
    appid: import.meta.env.VITE_WEATHER_API_KEY, // ดึงจาก .env
  },
});

// 👉 interceptor (ตัวเลือก) – log error ทุกครั้ง
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("Axios error:", err?.response || err);
    return Promise.reject(err);
  }
);

export default instance;
