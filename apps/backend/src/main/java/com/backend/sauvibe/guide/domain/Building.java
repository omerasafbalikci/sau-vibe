package com.backend.sauvibe.guide.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * @author Ömer Asaf Balıkçı
 */
@Entity
@Table(name = "building")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Building {

  @Id
  private Integer number;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String nameEn;

  @Enumerated(EnumType.STRING)
  private BuildingCategory category;

  @Column(columnDefinition = "TEXT")
  private String description;

  private String phone;
  private String email;
  private String photoUrl;
}