package com.backend.sauvibe.discover.note.repository;

import com.backend.sauvibe.discover.note.domain.NoteReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface NoteReactionRepository extends JpaRepository<NoteReaction, Long> {

  List<NoteReaction> findByNoteId(String noteId);

  List<NoteReaction> findByNoteIdIn(List<String> noteIds);

  Optional<NoteReaction> findByNoteIdAndDeviceId(String noteId, String deviceId);
}