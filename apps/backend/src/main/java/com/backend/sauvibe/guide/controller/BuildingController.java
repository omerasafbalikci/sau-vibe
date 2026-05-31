package com.backend.sauvibe.guide.controller;

import com.backend.sauvibe.guide.domain.BuildingCategory;
import com.backend.sauvibe.guide.domain.BuildingResponse;
import com.backend.sauvibe.guide.manager.BuildingManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
@RestController
@RequestMapping("/campus/buildings")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
public class BuildingController {

  private final BuildingManager buildingManager;

  @GetMapping
  public ResponseEntity<List<BuildingResponse>> getAll(@RequestParam(required = false) BuildingCategory category) {
    if (category != null) return ResponseEntity.ok(buildingManager.getByCategory(category));
    return ResponseEntity.ok(buildingManager.getAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<BuildingResponse> getById(@PathVariable Integer id) {
    return ResponseEntity.ok(buildingManager.getById(id));
  }

  @GetMapping("/search")
  public ResponseEntity<List<BuildingResponse>> search(@RequestParam String q) {
    return ResponseEntity.ok(buildingManager.search(q));
  }
}