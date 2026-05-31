package com.backend.sauvibe.discover.experience.repository;

import com.backend.sauvibe.discover.experience.domain.Experience;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface ExperienceRepository extends JpaRepository<Experience, String> {
}