package com.backend.sauvibe.discover.experience.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Ömer Asaf Balıkçı
 */
@Entity
@Table(name = "experience_reaction", uniqueConstraints = @UniqueConstraint(columnNames = {"experience_id", "device_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceReaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "experience_id", nullable = false)
  private String experienceId;

  @Column(name = "device_id", nullable = false)
  private String deviceId;

  @Column(nullable = false)
  private String emoji;
}