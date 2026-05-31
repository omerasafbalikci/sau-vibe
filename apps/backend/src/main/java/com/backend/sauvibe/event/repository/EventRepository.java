package com.backend.sauvibe.event.repository;

import com.backend.sauvibe.event.domain.Event;
import com.backend.sauvibe.event.domain.EventCategory;
import com.backend.sauvibe.event.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface EventRepository extends JpaRepository<Event, Long> {

  List<Event> findByStatusOrderByCreatedAtDesc(EventStatus status);

  List<Event> findByStatusAndCategoryOrderByCreatedAtDesc(EventStatus status, EventCategory category);

  List<Event> findAllByOrderByCreatedAtDesc();
}