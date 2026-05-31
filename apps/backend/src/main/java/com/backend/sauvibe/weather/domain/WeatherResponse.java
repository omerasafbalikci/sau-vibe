package com.backend.sauvibe.weather.domain;

/**
 * @author Ömer Asaf Balıkçı
 */
public record WeatherResponse(double temperature, String description, int humidity, double windSpeed, String iconCode, String comment) {
}