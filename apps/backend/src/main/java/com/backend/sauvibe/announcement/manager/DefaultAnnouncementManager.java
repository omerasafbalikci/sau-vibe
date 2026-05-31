package com.backend.sauvibe.announcement.manager;

import com.backend.sauvibe.announcement.domain.AnnouncementResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Duration;

/**
 * @author Ömer Asaf Balıkçı
 */
@Slf4j
@Service
public class DefaultAnnouncementManager implements AnnouncementManager {

  private final StringRedisTemplate redis;
  private final ObjectMapper objectMapper;

  private static final String CACHE_KEY = "announcement:latest";
  private static final String OGR_ISL_DUYURU_URL = "https://ogrisl.sakarya.edu.tr/tr/duyuru/goruntule/liste";

  public DefaultAnnouncementManager(StringRedisTemplate redis, ObjectMapper objectMapper) {
    this.redis = redis;
    this.objectMapper = objectMapper;
  }

  @Override
  public AnnouncementResponse getLatestAnnouncement() {
    try {
      String cachedAnnouncement = this.redis.opsForValue().get(CACHE_KEY);
      if (cachedAnnouncement != null) {
        log.info("Latest announcement successfully retrieved from Redis cache.");
        return this.objectMapper.readValue(cachedAnnouncement, AnnouncementResponse.class);
      }
    } catch (Exception e) {
      log.warn("Failed to read latest announcement from Redis cache: {}", e.getMessage());
    }

    log.info("Fetching fresh announcement from SAU Student Affairs website...");
    try {
      Document doc = Jsoup.connect(OGR_ISL_DUYURU_URL)
        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .timeout(8000)
        .get();

      Element firstEventItem = doc.selectFirst(".list-event-item .box-content-inner");

      if (firstEventItem != null) {
        Element titleElement = firstEventItem.selectFirst(".event-title a");
        String title = titleElement != null ? titleElement.text().trim() : "Yeni Duyuru";
        String url = titleElement != null ? titleElement.attr("href") : OGR_ISL_DUYURU_URL;

        Element dateElement = firstEventItem.selectFirst(".event-date");
        String date = dateElement != null ? dateElement.text().trim() : "Yakın Zamanda";

        String rawExcerpt = firstEventItem.ownText().trim();
        rawExcerpt = rawExcerpt.replace("\u00A0", " ");

        String excerpt = formatExcerpt(rawExcerpt);

        AnnouncementResponse response = new AnnouncementResponse(title, date, excerpt, url);
        saveToCache(response);
        return response;
      }

    } catch (IOException e) {
      log.error("Error occurred while fetching announcement from SAU: ", e);
    }

    return getFallbackAnnouncement();
  }

  private void saveToCache(AnnouncementResponse response) {
    try {
      this.redis.opsForValue().set(CACHE_KEY, this.objectMapper.writeValueAsString(response), Duration.ofMinutes(30));
      log.info("Latest announcement successfully saved to Redis cache for 30 minutes.");
    } catch (Exception e) {
      log.error("Failed to write announcement to Redis cache: {}", e.getMessage());
    }
  }

  private String formatExcerpt(String text) {
    if (text == null || text.isEmpty()) {
      return "Duyuru detayları için lütfen bağlantıya tıklayın...";
    }

    if (text.length() <= 130) {
      return text.endsWith("...") ? text : text + "...";
    }

    String trimmed = text.substring(0, 130);
    int lastSpaceIndex = trimmed.lastIndexOf(" ");

    if (lastSpaceIndex > 0) {
      trimmed = trimmed.substring(0, lastSpaceIndex);
    }

    return trimmed.replaceAll("[.,;!?…]+$", "") + "...";
  }

  private AnnouncementResponse getFallbackAnnouncement() {
    return new AnnouncementResponse("Duyurulara Şu An Erişilemiyor", "Bugün",
      "Üniversite sistemlerindeki yoğunluk sebebiyle duyurular şu an çekilemiyor. Lütfen resmi siteyi ziyaret edin...",
      OGR_ISL_DUYURU_URL);
  }
}