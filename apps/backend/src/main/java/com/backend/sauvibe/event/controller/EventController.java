package com.backend.sauvibe.event.controller;

import com.backend.sauvibe.event.domain.EventCategory;
import com.backend.sauvibe.event.domain.EventCreateRequest;
import com.backend.sauvibe.event.domain.EventResponse;
import com.backend.sauvibe.event.manager.EventManager;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
public class EventController {

  private final EventManager eventService;

  @Value("${app.admin-key}")
  private String adminKey;

  @PostMapping
  public ResponseEntity<EventResponse> create(@Valid @RequestBody EventCreateRequest request) {
    return ResponseEntity.ok(this.eventService.create(request));
  }

  @GetMapping
  public ResponseEntity<List<EventResponse>> getApprovedEvents(@RequestParam(required = false) EventCategory category) {
    return ResponseEntity.ok(this.eventService.getApprovedEvents(category));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteByUser(@PathVariable Long id, @RequestParam String password) {
    this.eventService.deleteByUser(id, password);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/admin")
  public ResponseEntity<List<EventResponse>> adminGetAll(@RequestHeader("X-Admin-Key") String key) {
    checkAdmin(key);
    return ResponseEntity.ok(this.eventService.getAll());
  }

  @GetMapping("/admin/pending")
  public ResponseEntity<List<EventResponse>> getPending(@RequestHeader("X-Admin-Key") String key) {
    checkAdmin(key);
    return ResponseEntity.ok(this.eventService.getPendingEvents());
  }

  @PutMapping("/admin/{id}/approve")
  public ResponseEntity<EventResponse> approve(@PathVariable Long id, @RequestHeader("X-Admin-Key") String key) {
    checkAdmin(key);
    return ResponseEntity.ok(this.eventService.approve(id));
  }

  @PutMapping("/admin/{id}/reject")
  public ResponseEntity<EventResponse> reject(@PathVariable Long id, @RequestHeader("X-Admin-Key") String key) {
    checkAdmin(key);
    return ResponseEntity.ok(this.eventService.reject(id));
  }

  @DeleteMapping("/admin/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id, @RequestHeader("X-Admin-Key") String key) {
    checkAdmin(key);
    this.eventService.delete(id);
    return ResponseEntity.noContent().build();
  }

  private void checkAdmin(String key) {
    if (!this.adminKey.equals(key)) {
      throw new RuntimeException("Unauthorized access");
    }
  }
}