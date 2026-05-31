package com.backend.sauvibe.weather.domain;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
public record OpenWeatherResponse(List<WeatherInfo> weather, MainInfo main, WindInfo wind) {
}
