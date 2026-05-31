package com.backend.sauvibe.discover.note.repository;

import com.backend.sauvibe.discover.note.domain.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface NoteRepository extends JpaRepository<Note, String> {

  List<Note> findByRoomId(String roomId);

  List<Note> findByRoomIdAndCategory(String roomId, String category);
}