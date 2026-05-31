package com.backend.sauvibe.discover.note.domain;

import java.util.Map;

/**
 * @author Ömer Asaf Balıkçı
 */
public record NoteResponse(String id, String category, String roomId, String text, String contactType,
                           String contactValue, Map<String, Long> reactions, String createdAt) {
}
