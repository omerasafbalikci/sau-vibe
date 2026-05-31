package com.backend.sauvibe.discover.experience.controller;

import com.backend.sauvibe.discover.experience.domain.Experience;
import com.backend.sauvibe.discover.experience.domain.ExperienceReactRequest;
import com.backend.sauvibe.discover.experience.domain.ExperienceRequest;
import com.backend.sauvibe.discover.experience.domain.ExperienceResponse;
import com.backend.sauvibe.discover.experience.manager.ExperienceManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * @author Ömer Asaf Balıkçı
 */
@RestController
@RequestMapping("/experiences")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
public class ExperienceController {

  private final ExperienceManager experienceManager;

  @GetMapping
  public ResponseEntity<List<ExperienceResponse>> getExperiences(@RequestParam(value = "sort", defaultValue = "NEW") String sort) {
    return ResponseEntity.ok(experienceManager.getExperiences(sort));
  }

  @PostMapping
  public ResponseEntity<Experience> createExperience(@RequestBody ExperienceRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(experienceManager.createExperience(request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteExperience(@PathVariable("id") String id, @RequestParam("deleteKey") String deleteKey) {
    experienceManager.deleteExperience(id, deleteKey);
    return ResponseEntity.ok(Map.of("success", true, "message", "Experience has been removed from the feed."));
  }

  @PostMapping("/{id}/react")
  public ResponseEntity<?> reactToExperience(@PathVariable("id") String id, @RequestBody ExperienceReactRequest request) {
    experienceManager.reactToExperience(id, request);
    return ResponseEntity.ok(Map.of("success", true));
  }
}