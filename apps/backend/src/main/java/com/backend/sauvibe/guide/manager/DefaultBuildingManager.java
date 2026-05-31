package com.backend.sauvibe.guide.manager;

import com.backend.sauvibe.guide.domain.BuildingCategory;
import com.backend.sauvibe.guide.domain.BuildingResponse;
import com.backend.sauvibe.guide.repository.BuildingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
@Service
@RequiredArgsConstructor
public class DefaultBuildingManager implements BuildingManager {

  private final BuildingRepository buildingRepository;

  public List<BuildingResponse> getAll() {
    return this.buildingRepository.findAll().stream().map(BuildingResponse::from).toList();
  }

  public BuildingResponse getById(Integer id) {
    return this.buildingRepository.findById(id)
      .map(BuildingResponse::from)
      .orElseThrow(() -> new RuntimeException("Building not found: " + id));
  }

  public List<BuildingResponse> getByCategory(BuildingCategory category) {
    return this.buildingRepository.findByCategory(category).stream().map(BuildingResponse::from).toList();
  }

  public List<BuildingResponse> search(String query) {
    return this.buildingRepository.findByNameContainingIgnoreCase(query).stream().map(BuildingResponse::from).toList();
  }
}
