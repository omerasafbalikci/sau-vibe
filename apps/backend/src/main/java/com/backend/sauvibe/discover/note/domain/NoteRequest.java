package com.backend.sauvibe.discover.note.domain;

/**
 * @author Ömer Asaf Balıkçı
 */
public record NoteRequest(String text, String category, String roomId, String roomPassword, String contactType,
                          String contactValue, String deleteKey) {
}
