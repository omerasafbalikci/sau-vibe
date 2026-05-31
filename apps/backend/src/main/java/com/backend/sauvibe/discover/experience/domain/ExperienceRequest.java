package com.backend.sauvibe.discover.experience.domain;

/**
 * @author Ömer Asaf Balıkçı
 */
public record ExperienceRequest(String imageUrl, String description, String contactType, String contactValue,
                                String deleteKey) {
}
