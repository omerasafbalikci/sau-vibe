package com.backend.sauvibe.weather.manager;

import com.backend.sauvibe.weather.domain.OpenWeatherResponse;
import com.backend.sauvibe.weather.domain.WeatherResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.LocalTime;

/**
 * @author Ömer Asaf Balıkçı
 */
@Slf4j
@Service
public class DefaultWeatherManager implements WeatherManager {

  private final StringRedisTemplate redis;
  private final ObjectMapper objectMapper;
  private final RestClient restClient;

  @Value("${app.weather.api-key}")
  private String apiKey;

  private static final String CACHE_KEY = "weather:sakarya";
  private static final double LAT = 40.7569;
  private static final double LON = 30.3774;

  public DefaultWeatherManager(StringRedisTemplate redis, ObjectMapper objectMapper, RestClient.Builder restClientBuilder) {
    this.redis = redis;
    this.objectMapper = objectMapper;
    this.restClient = restClientBuilder.baseUrl("https://api.openweathermap.org").build();
  }

  @Override
  public WeatherResponse getWeather() {
    try {
      String cached = this.redis.opsForValue().get(CACHE_KEY);
      if (cached != null) {
        log.info("Weather data successfully retrieved from Redis cache.");
        return this.objectMapper.readValue(cached, WeatherResponse.class);
      }
    } catch (Exception e) {
      log.warn("Failed to read weather data from Redis cache: {}", e.getMessage());
    }

    try {
      log.info("Fetching fresh weather data from OpenWeather API...");
      String uri = String.format("/data/2.5/weather?lat=%s&lon=%s&appid=%s&units=metric&lang=tr", LAT, LON, this.apiKey);

      OpenWeatherResponse apiResponse = this.restClient.get()
        .uri(uri)
        .retrieve()
        .body(OpenWeatherResponse.class);

      if (apiResponse == null || apiResponse.weather().isEmpty()) {
        throw new RuntimeException("API returned an empty or invalid response.");
      }

      var weatherInfo = apiResponse.weather().getFirst();
      double temp = apiResponse.main().temp();
      String description = weatherInfo.description();

      String comment = generateComment(description, temp, apiResponse.wind().speed());

      WeatherResponse response = new WeatherResponse(Math.round(temp * 10.0) / 10.0, description, apiResponse.main().humidity(), apiResponse.wind().speed(), weatherInfo.icon(), comment);
      saveToCache(response);
      return response;
    } catch (Exception e) {
      log.error("Error occurred while fetching weather data from OpenWeather API: ", e);
      return new WeatherResponse(15.0, "Veri alınamadı", 50, 2.0, "01d", "Esentepe sistemlerinde geçici bir kesinti var 🛠️");
    }
  }

  private void saveToCache(WeatherResponse response) {
    try {
      this.redis.opsForValue().set(CACHE_KEY, this.objectMapper.writeValueAsString(response), Duration.ofMinutes(15));
      log.info("Weather data successfully saved to Redis cache for 15 minutes.");
    } catch (Exception e) {
      log.error("Failed to write weather data to Redis cache: {}", e.getMessage());
    }
  }

  private String generateComment(String desc, double temp, double wind) {
    int hour = LocalTime.now().getHour();
    String lower = desc.toLowerCase();

    if (lower.contains("yağmur") || lower.contains("rain")) {
      return "Esentepe'de " + desc + " var ☔ Bilgisayar Mühendisliği binasına kaçmak için tam zamanı!";
    }
    if (lower.contains("kar") || lower.contains("snow")) {
      return "Kampüste kar yağıyor ❄️ Kütüphaneye gidin, sıcak bir köşe bulun!";
    }
    if (temp > 30) {
      return (int) temp + "°C — Kavurucu sıcak! 🥵 Gölgeli banklar veya klimalı kütüphane tam size göre.";
    }
    if (temp < 5) {
      return (int) temp + "°C — Dondurucu soğuk! 🧣 Kantinden sıcak çay alıp derse öyle gidin.";
    }
    if (wind > 10) {
      return "Rüzgar " + (int) wind + " m/s 💨 Şapkalarınızı tutun, Esentepe bugün fırtınalı!";
    }
    if (hour >= 8 && hour <= 10) {
      return "Günaydın! " + (int) temp + "°C ile güzel bir sabah ☀️ Derse geç kalmayın!";
    }
    if (hour >= 12 && hour <= 14) {
      return (int) temp + "°C — Öğle arası hava güzel 🌤️ Yemekhanede kalabalık olabilir, bahçeyi deneyin!";
    }
    return "Esentepe bugün " + (int) temp + "°C — " + desc + ". Kampüs hayatının tadını çıkarın! 🎓";
  }
}