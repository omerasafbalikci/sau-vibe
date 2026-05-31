package com.backend.sauvibe.guide.domain;

/**
 * @author Ömer Asaf Balıkçı
 */
public record BuildingResponse(Integer number, String name, String nameEn, BuildingCategory category,
                               String description, String phone, String email, String photoUrl) {

  public static BuildingResponse from(Building b) {
    return new BuildingResponse(
      b.getNumber(), b.getName(), b.getNameEn(),
      b.getCategory(), b.getDescription(),
      b.getPhone(), b.getEmail(), b.getPhotoUrl());
  }
}