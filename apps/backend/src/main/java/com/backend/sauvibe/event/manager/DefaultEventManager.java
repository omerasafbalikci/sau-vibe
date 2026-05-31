package com.backend.sauvibe.event.manager;

import com.backend.sauvibe.event.domain.*;
import com.backend.sauvibe.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
@Service
@RequiredArgsConstructor
public class DefaultEventManager implements EventManager {

  private final EventRepository eventRepository;

  @Override
  public EventResponse create(EventCreateRequest request) {
    Event event = Event.builder()
      .title(request.title())
      .description(request.description())
      .category(request.category())
      .contactType(request.contactType())
      .contactValue(request.contactValue())
      .author(request.author())
      .status(EventStatus.PENDING)
      .deletePassword(request.deletePassword())
      .build();
    return EventResponse.from(this.eventRepository.save(event));
  }

  @Override
  public List<EventResponse> getApprovedEvents(EventCategory category) {
    if (category != null) {
      return this.eventRepository.findByStatusAndCategoryOrderByCreatedAtDesc(EventStatus.APPROVED, category)
        .stream().map(EventResponse::from).toList();
    }
    return this.eventRepository.findByStatusOrderByCreatedAtDesc(EventStatus.APPROVED)
      .stream().map(EventResponse::from).toList();
  }

  @Override
  public List<EventResponse> getAll() {
    return this.eventRepository.findAllByOrderByCreatedAtDesc()
      .stream().map(EventResponse::from).toList();
  }

  @Override
  public List<EventResponse> getPendingEvents() {
    return this.eventRepository.findByStatusOrderByCreatedAtDesc(EventStatus.PENDING)
      .stream().map(EventResponse::from).toList();
  }

  @Override
  public EventResponse approve(Long id) {
    Event event = this.eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    event.setStatus(EventStatus.APPROVED);
    event.setApprovalDate(LocalDateTime.now());
    return EventResponse.from(this.eventRepository.save(event));
  }

  @Override
  public EventResponse reject(Long id) {
    Event event = this.eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    event.setStatus(EventStatus.REJECTED);
    return EventResponse.from(this.eventRepository.save(event));
  }

  @Override
  public void deleteByUser(Long id, String password) {
    Event event = this.eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    if (!event.getDeletePassword().equals(password)) {
      throw new RuntimeException("Incorrect password");
    }
    this.eventRepository.delete(event);
  }

  @Override
  public void delete(Long id) {
    this.eventRepository.deleteById(id);
  }
}
