package com.backend.sauvibe.menu.domain;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
public record CafeteriaMenuResponse(String date, String menuType, int totalCalories, List<MenuItem> items) {
}
