package com.backend.sauvibe.discover.experience.manager;

import com.backend.sauvibe.discover.experience.domain.Experience;
import com.backend.sauvibe.discover.experience.domain.ExperienceReactRequest;
import com.backend.sauvibe.discover.experience.domain.ExperienceRequest;
import com.backend.sauvibe.discover.experience.domain.ExperienceResponse;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface ExperienceManager {

  List<ExperienceResponse> getExperiences(String sort);

  Experience createExperience(ExperienceRequest request);

  void deleteExperience(String id, String deleteKey);

  void reactToExperience(String id, ExperienceReactRequest request);
}
