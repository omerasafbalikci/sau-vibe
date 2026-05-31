package com.backend.sauvibe.discover.note.manager;

import com.backend.sauvibe.discover.note.domain.*;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface NoteManager {

  List<NoteResponse> getNotes(String room, String category, String sort);

  Note createNote(NoteRequest request);

  void deleteNote(String id, String deleteKey);

  boolean existRoom(String roomId);

  void createRoom(RoomRequest request);

  void deleteRoom(String roomId, String roomPassword);

  void reactToNote(String id, NoteReactRequest request);
}
