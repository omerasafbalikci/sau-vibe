package com.backend.sauvibe.discover.note.controller;

import com.backend.sauvibe.discover.note.domain.*;
import com.backend.sauvibe.discover.note.manager.NoteManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * @author Ömer Asaf Balıkçı
 */
@RestController
@RequestMapping("/notes")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
public class NoteController {

  private final NoteManager noteManager;

  @GetMapping
  public ResponseEntity<List<NoteResponse>> getNotes(@RequestParam(value = "room", defaultValue = "PUBLIC") String room,
                                                     @RequestParam(value = "category", defaultValue = "ALL") String category,
                                                     @RequestParam(value = "sort", defaultValue = "NEW") String sort) {
    return ResponseEntity.ok(this.noteManager.getNotes(room, category, sort));
  }

  @PostMapping
  public ResponseEntity<Note> createNote(@RequestBody NoteRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(this.noteManager.createNote(request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteNote(@PathVariable("id") String id, @RequestParam("deleteKey") String deleteKey) {
    this.noteManager.deleteNote(id, deleteKey);
    return ResponseEntity.ok(Map.of("success", true, "message", "Note has been removed from the board."));
  }

  @GetMapping("/rooms/{roomId}/exists")
  public ResponseEntity<?> roomExists(@PathVariable String roomId) {
    if (this.noteManager.existRoom(roomId)) {
      return ResponseEntity.ok(Map.of("exists", true));
    }
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("exists", false, "message", "Bu oda bulunamadı."));
  }

  @PostMapping("/rooms")
  public ResponseEntity<?> createRoom(@RequestBody RoomRequest request) {
    this.noteManager.createRoom(request);
    return ResponseEntity.ok(Map.of("success", true, "roomId", request.roomId()));
  }

  @DeleteMapping("/rooms/{roomId}")
  public ResponseEntity<?> deleteRoom(@PathVariable("roomId") String roomId, @RequestParam("roomPassword") String roomPassword) {
    this.noteManager.deleteRoom(roomId, roomPassword);
    return ResponseEntity.ok(Map.of("success", true, "message", "The room and all its associated notes have been successfully deleted."));
  }

  @PostMapping("/{id}/react")
  public ResponseEntity<?> reactToNote(@PathVariable("id") String id, @RequestBody NoteReactRequest request) {
    this.noteManager.reactToNote(id, request);
    return ResponseEntity.ok(Map.of("success", true));
  }
}