package com.backend.sauvibe.announcement.controller;

import com.backend.sauvibe.announcement.domain.AnnouncementResponse;
import com.backend.sauvibe.announcement.manager.AnnouncementManager;
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
@RequestMapping("/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
public class AnnouncementController {

  private final AnnouncementManager announcementManager;

  @GetMapping("/latest")
  public ResponseEntity<AnnouncementResponse> getLatest() {
    return ResponseEntity.ok(this.announcementManager.getLatestAnnouncement());
  }
}