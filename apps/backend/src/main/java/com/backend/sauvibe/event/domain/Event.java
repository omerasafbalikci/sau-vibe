package com.backend.sauvibe.event.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * @author Ömer Asaf Balıkçı
 */
@Entity
@Table(name = "event")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EventCategory category;

  private String contactType;
  private String contactValue;

  @Column(nullable = false)
  private String author;

  @Enumerated(EnumType.STRING)
  @Builder.Default
  private EventStatus status = EventStatus.PENDING;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  private LocalDateTime approvalDate;

  @Column(nullable = false)
  private String deletePassword;

  @PrePersist
  public void prePersist() {
    this.createdAt = LocalDateTime.now();
  }
}