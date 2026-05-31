package com.backend.sauvibe.discover.note.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Ömer Asaf Balıkçı
 */
@Entity
@Table(name = "room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {

  @Id
  @Column(name = "room_id", nullable = false)
  private String roomId;

  @Column(name = "room_password", nullable = false)
  private String roomPassword;
}
