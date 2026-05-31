package com.backend.sauvibe.discover.note.repository;

import com.backend.sauvibe.discover.note.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface RoomRepository extends JpaRepository<Room, String> {
}
