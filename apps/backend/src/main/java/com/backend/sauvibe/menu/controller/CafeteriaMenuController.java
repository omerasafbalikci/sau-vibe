package com.backend.sauvibe.menu.controller;

import com.backend.sauvibe.menu.domain.CafeteriaMenuResponse;
import com.backend.sauvibe.menu.manager.CafeteriaMenuManager;
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
@RequestMapping("/cafeteria")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
public class CafeteriaMenuController {

  private final CafeteriaMenuManager cafeteriaMenuManager;

  @GetMapping("/today")
  public ResponseEntity<CafeteriaMenuResponse> getTodayMenu() {
    return ResponseEntity.ok(this.cafeteriaMenuManager.getDailyMenu());
  }
}
