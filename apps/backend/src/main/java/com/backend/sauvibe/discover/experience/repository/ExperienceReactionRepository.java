package com.backend.sauvibe.discover.experience.repository;

import com.backend.sauvibe.discover.experience.domain.ExperienceReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface ExperienceReactionRepository extends JpaRepository<ExperienceReaction, Long> {

  List<ExperienceReaction> findByExperienceId(String experienceId);

  List<ExperienceReaction> findByExperienceIdIn(List<String> experienceIds);

  Optional<ExperienceReaction> findByExperienceIdAndDeviceId(String experienceId, String deviceId);
}