package com.backend.sauvibe.guide.manager;

import com.backend.sauvibe.guide.domain.BuildingCategory;
import com.backend.sauvibe.guide.domain.BuildingResponse;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface BuildingManager {

  List<BuildingResponse> getAll();

  BuildingResponse getById(Integer id);

  List<BuildingResponse> getByCategory(BuildingCategory category);

  List<BuildingResponse> search(String query);
}
