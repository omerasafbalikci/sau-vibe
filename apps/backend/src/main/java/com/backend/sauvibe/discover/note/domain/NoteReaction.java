package com.backend.sauvibe.discover.note.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Ömer Asaf Balıkçı
 */
@Entity
@Table(name = "note_reaction", uniqueConstraints = @UniqueConstraint(columnNames = {"note_id", "device_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteReaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "note_id", nullable = false)
  private String noteId;

  @Column(name = "device_id", nullable = false)
  private String deviceId;

  @Column(nullable = false)
  private String emoji;
}
