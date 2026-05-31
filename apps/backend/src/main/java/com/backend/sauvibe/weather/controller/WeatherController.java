package com.backend.sauvibe.weather.controller;

import com.backend.sauvibe.weather.domain.WeatherResponse;
import com.backend.sauvibe.weather.manager.WeatherManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Ömer Asaf Balıkçı
 */
@RestController
@RequestMapping("/weather")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
public class WeatherController {

  private final WeatherManager weatherManager;

  @GetMapping
  public ResponseEntity<WeatherResponse> getWeather() {
    return ResponseEntity.ok(this.weatherManager.getWeather());
  }
}