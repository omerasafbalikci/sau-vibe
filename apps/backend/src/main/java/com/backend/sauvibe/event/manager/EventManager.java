package com.backend.sauvibe.event.manager;

import com.backend.sauvibe.event.domain.EventCategory;
import com.backend.sauvibe.event.domain.EventCreateRequest;
import com.backend.sauvibe.event.domain.EventResponse;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface EventManager {

  EventResponse create(EventCreateRequest request);

  List<EventResponse> getApprovedEvents(EventCategory category);

  List<EventResponse> getAll();

  List<EventResponse> getPendingEvents();

  EventResponse approve(Long id);

  EventResponse reject(Long id);

  void deleteByUser(Long id, String password);

  void delete(Long id);
}
