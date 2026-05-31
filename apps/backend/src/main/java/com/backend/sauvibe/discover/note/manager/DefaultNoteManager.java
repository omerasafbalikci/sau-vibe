package com.backend.sauvibe.discover.note.manager;

import com.backend.sauvibe.discover.note.domain.*;
import com.backend.sauvibe.discover.note.repository.NoteReactionRepository;
import com.backend.sauvibe.discover.note.repository.NoteRepository;
import com.backend.sauvibe.discover.note.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author Ömer Asaf Balıkçı
 */
@Service
@RequiredArgsConstructor
public class DefaultNoteManager implements NoteManager {

  private final RoomRepository roomRepository;
  private final NoteRepository noteRepository;
  private final NoteReactionRepository reactionRepository;

  private static final List<String> BASE_EMOJIS = List.of("🔥", "👀", "💯", "❤️", "😂", "👏", "🙌", "📌");

  @Override
  @Transactional(readOnly = true)
  public List<NoteResponse> getNotes(String room, String category, String sort) {
    List<Note> dbNotes = "ALL".equals(category) ?
      this.noteRepository.findByRoomId(room) :
      this.noteRepository.findByRoomIdAndCategory(room, category);

    if (dbNotes.isEmpty()) {
      return Collections.emptyList();
    }

    List<String> noteIds = dbNotes.stream().map(Note::getId).collect(Collectors.toList());

    Map<String, List<NoteReaction>> reactionsByNoteId = this.reactionRepository.findByNoteIdIn(noteIds)
      .stream()
      .collect(Collectors.groupingBy(NoteReaction::getNoteId));

    List<NoteResponse> responseList = dbNotes.stream().map(note -> {
      List<NoteReaction> reactions = reactionsByNoteId.getOrDefault(note.getId(), Collections.emptyList());

      Map<String, Long> reactionCounts = reactions.stream()
        .collect(Collectors.groupingBy(NoteReaction::getEmoji, Collectors.counting()));

      BASE_EMOJIS.forEach(emoji -> reactionCounts.putIfAbsent(emoji, 0L));

      return new NoteResponse(
        note.getId(),
        note.getCategory(),
        note.getRoomId(),
        note.getText(),
        note.getContactType(),
        note.getContactValue(),
        reactionCounts,
        note.getCreatedAt());
    }).collect(Collectors.toList());

    if ("TREND".equals(sort)) {
      responseList.sort((a, b) -> {
        long sumA = a.reactions().values().stream().mapToLong(Long::longValue).sum();
        long sumB = b.reactions().values().stream().mapToLong(Long::longValue).sum();
        return Long.compare(sumB, sumA);
      });
    } else {
      responseList.sort((a, b) -> b.createdAt().compareTo(a.createdAt()));
    }

    return responseList;
  }

  @Override
  @Transactional
  public Note createNote(NoteRequest request) {
    if (request.text() == null || request.category() == null || request.contactType() == null || request.contactValue() == null || request.deleteKey() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please fill in all fields including the delete password.");
    }

    String targetRoom = (request.roomId() == null || request.roomId().trim().isEmpty()) ? "PUBLIC" : request.roomId();

    if (!"PUBLIC".equals(targetRoom)) {
      Optional<Room> roomOpt = this.roomRepository.findById(targetRoom);
      if (roomOpt.isEmpty() || !roomOpt.get().getRoomPassword().equals(request.roomPassword())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid room ID or password!");
      }
    }

    Note note = new Note();
    note.setId("note_" + UUID.randomUUID().toString().substring(0, 8));
    note.setText(request.text());
    note.setCategory(request.category());
    note.setRoomId(targetRoom);
    note.setContactType(request.contactType());
    note.setContactValue(request.contactValue());
    note.setDeleteKey(request.deleteKey());
    note.setCreatedAt(Instant.now().toString());

    return this.noteRepository.save(note);
  }

  @Override
  @Transactional
  public void deleteNote(String id, String deleteKey) {
    Note note = this.noteRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "The specified note could not be found."));

    if (!note.getDeleteKey().equals(deleteKey)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect delete password!");
    }

    List<NoteReaction> reactions = this.reactionRepository.findByNoteId(id);
    this.reactionRepository.deleteAll(reactions);

    this.noteRepository.delete(note);
  }

  @Override
  @Transactional
  public boolean existRoom(String roomId) {
    return this.roomRepository.existsById(roomId);
  }

  @Override
  @Transactional
  public void createRoom(RoomRequest request) {
    if (request.roomId() == null || request.roomPassword() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room ID and password are required.");
    }
    if (this.roomRepository.existsById(request.roomId())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This room ID already exists in the system.");
    }
    Room room = new Room(request.roomId(), request.roomPassword());
    this.roomRepository.save(room);
  }

  @Override
  @Transactional
  public void deleteRoom(String roomId, String roomPassword) {
    Room room = this.roomRepository.findById(roomId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "The specified room could not be found."));

    if (!room.getRoomPassword().equals(roomPassword)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect room password! Room deletion failed.");
    }

    List<Note> roomNotes = this.noteRepository.findByRoomId(roomId);
    for (Note note : roomNotes) {
      List<NoteReaction> reactions = this.reactionRepository.findByNoteId(note.getId());
      this.reactionRepository.deleteAll(reactions);
    }
    this.noteRepository.deleteAll(roomNotes);

    this.roomRepository.delete(room);
  }

  @Override
  @Transactional
  public void reactToNote(String id, NoteReactRequest request) {
    if (!this.noteRepository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found.");
    }

    if (request.emoji() == null || request.emoji().trim().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Emoji cannot be empty.");
    }

    Optional<NoteReaction> existingOpt = this.reactionRepository.findByNoteIdAndDeviceId(id, request.deviceId());
    if (existingOpt.isPresent()) {
      NoteReaction existing = existingOpt.get();
      if (existing.getEmoji().equals(request.emoji())) {
        this.reactionRepository.delete(existing);
      } else {
        existing.setEmoji(request.emoji());
        this.reactionRepository.save(existing);
      }
    } else {
      NoteReaction reaction = new NoteReaction(null, id, request.deviceId(), request.emoji());
      this.reactionRepository.save(reaction);
    }
  }
}