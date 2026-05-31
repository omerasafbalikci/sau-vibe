package com.backend.sauvibe.guide.repository;

import com.backend.sauvibe.guide.domain.Building;
import com.backend.sauvibe.guide.domain.BuildingCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface BuildingRepository extends JpaRepository<Building, Integer> {

  List<Building> findByCategory(BuildingCategory category);

  List<Building> findByNameContainingIgnoreCase(String name);
}