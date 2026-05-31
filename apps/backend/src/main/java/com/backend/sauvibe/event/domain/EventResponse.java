package com.backend.sauvibe.event.domain;

import java.time.LocalDateTime;

/**
 * @author Ömer Asaf Balıkçı
 */
public record EventResponse(Long id, String title, String description, EventCategory category, String contactType,
                            String contactValue, String author, EventStatus status, LocalDateTime createdAt,
                            LocalDateTime approvalDate) {

  public static EventResponse from(Event event) {
    return new EventResponse(event.getId(), event.getTitle(), event.getDescription(), event.getCategory(), event.getContactType(), event.getContactValue(), event.getAuthor(), event.getStatus(), event.getCreatedAt(), event.getApprovalDate());
  }
}
