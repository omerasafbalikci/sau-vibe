package com.backend.sauvibe.discover.experience.domain;

import java.util.Map;

/**
 * @author Ömer Asaf Balıkçı
 */
public record ExperienceResponse(String id, String imageUrl, String description, String contactType,
                                 String contactValue, Map<String, Long> reactions, String createdAt) {
}
