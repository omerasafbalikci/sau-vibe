package com.backend.sauvibe.event.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * @author Ömer Asaf Balıkçı
 */
public record EventCreateRequest(@NotBlank @Size(max = 100) String title,
                                 @NotBlank @Size(max = 1000) String description,
                                 @NotNull EventCategory category,
                                 @NotBlank String contactType,
                                 @NotBlank String contactValue,
                                 @NotBlank @Size(max = 60) String author,
                                 @NotBlank @Size(min = 4, max = 20) String deletePassword) {
}