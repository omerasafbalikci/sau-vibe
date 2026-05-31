package com.backend.sauvibe.discover.experience.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * @author Ömer Asaf Balıkçı
 */
@Entity
@Table(name = "experience")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Experience {

  @Id
  private String id;

  @Column(name = "image_url", columnDefinition = "TEXT", nullable = false)
  private String imageUrl;

  @Column(columnDefinition = "TEXT")
  private String description = "";

  @Column(name = "contact_type", nullable = false)
  private String contactType;

  @Column(name = "contact_value", nullable = false)
  private String contactValue;

  @Column(name = "delete_key", nullable = false)
  private String deleteKey;

  @Column(name = "created_at", nullable = false)
  private String createdAt = Instant.now().toString();
}
