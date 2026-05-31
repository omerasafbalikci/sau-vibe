package com.backend.sauvibe.menu.manager;

import com.backend.sauvibe.menu.domain.CafeteriaMenuResponse;
import com.backend.sauvibe.menu.domain.MenuItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * @author Ömer Asaf Balıkçı
 */
@Slf4j
@Service
public class DefaultCafeteriaMenuManager implements CafeteriaMenuManager {

  private final StringRedisTemplate redis;
  private final ObjectMapper objectMapper;

  private static final String CACHE_KEY_PREFIX = "menu:cafeteria:";
  private static final String SABIS_MENU_AJAX_URL = "https://menu.sabis.sakarya.edu.tr/Home/GetirGunlukMenu";

  public DefaultCafeteriaMenuManager(StringRedisTemplate redis, ObjectMapper objectMapper) {
    this.redis = redis;
    this.objectMapper = objectMapper;
  }

  @Override
  public CafeteriaMenuResponse getDailyMenu() {
    try {
      String cacheKey = CACHE_KEY_PREFIX + LocalDate.now();
      String cachedMenu = this.redis.opsForValue().get(cacheKey);
      if (cachedMenu != null) {
        log.info("Cafeteria menu successfully retrieved from Redis cache.");
        return this.objectMapper.readValue(cachedMenu, CafeteriaMenuResponse.class);
      }
    } catch (Exception e) {
      log.warn("Failed to read cafeteria menu from Redis cache: {}", e.getMessage());
    }

    log.info("Fetching fresh cafeteria menu from SABIS AJAX API...");
    List<MenuItem> items = new ArrayList<>();
    int totalCalories = 0;
    String menuType = "Genel Menü";

    LocalDate today = LocalDate.now();
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM EEEE", Locale.of("tr"));
    String dateText = today.format(formatter);

    try {
      Document doc = Jsoup.connect(SABIS_MENU_AJAX_URL)
        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .header("X-Requested-With", "XMLHttpRequest")
        .data("year", String.valueOf(today.getYear()))
        .data("month", String.valueOf(today.getMonthValue()))
        .data("day", String.valueOf(today.getDayOfMonth()))
        .timeout(8000)
        .post();

      Elements menuRows = doc.select(".normalmenu .list-group-item");

      for (Element row : menuRows) {
        String rawText = row.text().trim();
        if (rawText.isEmpty()) continue;

        String foodName = rawText;
        int calories = 0;

        Element smallTag = row.selectFirst("small");
        if (smallTag != null) {
          String calorieText = smallTag.text();
          String numericPart = calorieText.replaceAll("[^0-9]", "").trim();
          if (!numericPart.isEmpty()) {
            try {
              calories = Integer.parseInt(numericPart);
              totalCalories += calories;
            } catch (NumberFormatException ignored) {
            }
          }
          foodName = foodName.replace(calorieText, "").trim();
        }

        String foodType = determineFoodType(items.size(), foodName);
        items.add(new MenuItem(foodType, foodName, calories));
      }

      if (items.isEmpty()) {
        return getWeekendOrHolidayMenu(dateText);
      }

      CafeteriaMenuResponse response = new CafeteriaMenuResponse("Bugün - " + dateText, menuType, totalCalories, items);
      saveToCache(response);
      return response;

    } catch (IOException e) {
      log.error("Error occurred while fetching menu from SABIS: ", e);
      return getMockFallbackMenu();
    }
  }

  private void saveToCache(CafeteriaMenuResponse response) {
    try {
      String cacheKey = CACHE_KEY_PREFIX + LocalDate.now();
      LocalDateTime now = LocalDateTime.now();
      LocalDateTime midnight = now.toLocalDate().plusDays(1).atStartOfDay();
      Duration untilMidnight = Duration.between(now, midnight);
      this.redis.opsForValue().set(cacheKey, this.objectMapper.writeValueAsString(response), untilMidnight);
      log.info("Menu cached until midnight: {} seconds remaining", untilMidnight.getSeconds());
    } catch (Exception e) {
      log.error("Failed to write menu to Redis cache: {}", e.getMessage());
    }
  }

  private String determineFoodType(int currentIndex, String foodName) {
    String lowerName = foodName.toLowerCase();
    if (lowerName.contains("çorba")) {
      return "Çorba";
    } else if (lowerName.contains("etsiz") || lowerName.contains("vejetaryen")) {
      return "Alternatif Yemek";
    } else if (lowerName.contains("köfte") || lowerName.contains("tavuk") || lowerName.contains("et") || lowerName.contains("kavurma")) {
      return "Ana Yemek";
    } else if (lowerName.contains("salata") || lowerName.contains("karpuz") || lowerName.contains("meyve") || lowerName.contains("tatlı")) {
      return "Tamamlayıcı / Tatlı";
    }

    return switch (currentIndex) {
      case 0 -> "Çorba";
      case 1 -> "Ana Yemek";
      case 2 -> "Yardımcı Yemek";
      case 3 -> "Alternatif Yemek";
      default -> "Tamamlayıcı / Tatlı";
    };
  }

  private CafeteriaMenuResponse getWeekendOrHolidayMenu(String dateText) {
    return new CafeteriaMenuResponse(dateText, "Servis Yok", 0,
      List.of(new MenuItem("Bilgi", "Bugün için yemekhane hizmeti bulunmamaktadır.", 0)));
  }

  private CafeteriaMenuResponse getMockFallbackMenu() {
    return new CafeteriaMenuResponse("Bağlantı Hatası", "Sistem Çevrimdışı", 0,
      List.of(new MenuItem("Duyuru", "SABİS yemekhane servisine şu an erişilemiyor. Lütfen daha sonra tekrar deneyin.", 0)));
  }
}