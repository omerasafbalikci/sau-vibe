package com.backend.sauvibe.discover.experience.manager;

import com.backend.sauvibe.discover.experience.domain.*;
import com.backend.sauvibe.discover.experience.repository.ExperienceReactionRepository;
import com.backend.sauvibe.discover.experience.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author Ömer Asaf Balıkçı
 */
@Service
@RequiredArgsConstructor
public class DefaultExperienceManager implements ExperienceManager {

  private final ExperienceRepository experienceRepository;
  private final ExperienceReactionRepository experienceReactionRepository;

  private static final List<String> BASE_EMOJIS = List.of("❤️", "🔥", "🙌", "😂", "😮");

  @Override
  @Transactional(readOnly = true)
  public List<ExperienceResponse> getExperiences(String sort) {
    List<Experience> list = this.experienceRepository.findAll();

    if (list.isEmpty()) {
      return Collections.emptyList();
    }

    List<String> experienceIds = list.stream()
      .map(Experience::getId)
      .collect(Collectors.toList());

    Map<String, List<ExperienceReaction>> reactionsByExpId = this.experienceReactionRepository
      .findByExperienceIdIn(experienceIds)
      .stream()
      .collect(Collectors.groupingBy(ExperienceReaction::getExperienceId));

    List<ExperienceResponse> responseList = list.stream().map(exp -> {
      List<ExperienceReaction> reactions = reactionsByExpId
        .getOrDefault(exp.getId(), Collections.emptyList());

      Map<String, Long> reactionCounts = reactions.stream()
        .collect(Collectors.groupingBy(ExperienceReaction::getEmoji, Collectors.counting()));

      BASE_EMOJIS.forEach(emoji -> reactionCounts.putIfAbsent(emoji, 0L));

      return new ExperienceResponse(
        exp.getId(),
        exp.getImageUrl(),
        exp.getDescription() != null ? exp.getDescription() : "",
        exp.getContactType(),
        exp.getContactValue(),
        reactionCounts,
        exp.getCreatedAt());
    }).collect(Collectors.toList());

    if ("TREND".equals(sort)) {
      responseList.sort((a, b) -> {
        long sumA = a.reactions().values().stream().mapToLong(Long::longValue).sum();
        long sumB = b.reactions().values().stream().mapToLong(Long::longValue).sum();
        return Long.compare(sumB, sumA);
      });
    } else {
      responseList.sort((a, b) -> b.createdAt().compareTo(a.createdAt()));
    }

    return responseList;
  }

  @Override
  @Transactional
  public Experience createExperience(ExperienceRequest request) {
    if (request.imageUrl() == null || request.contactType() == null || request.contactValue() == null || request.deleteKey() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please fill in all fields completely, including the delete password.");
    }

    Experience exp = new Experience();
    exp.setId("exp_" + UUID.randomUUID().toString().substring(0, 8));
    exp.setImageUrl(request.imageUrl());
    exp.setDescription(request.description());
    exp.setContactType(request.contactType());
    exp.setContactValue(request.contactValue());
    exp.setDeleteKey(request.deleteKey());
    exp.setCreatedAt(Instant.now().toString());

    return this.experienceRepository.save(exp);
  }

  @Override
  @Transactional
  public void deleteExperience(String id, String deleteKey) {
    Experience exp = this.experienceRepository.findById(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "The specified experience feed could not be found."));

    if (!exp.getDeleteKey().equals(deleteKey)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect delete password!");
    }

    List<ExperienceReaction> reactions = this.experienceReactionRepository.findByExperienceId(id);
    this.experienceReactionRepository.deleteAll(reactions);
    this.experienceRepository.delete(exp);
  }

  @Override
  @Transactional
  public void reactToExperience(String id, ExperienceReactRequest request) {
    if (!this.experienceRepository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Experience not found.");
    }

    if (request.emoji() == null || request.emoji().trim().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Emoji cannot be empty.");
    }

    Optional<ExperienceReaction> existingOpt = this.experienceReactionRepository.findByExperienceIdAndDeviceId(id, request.deviceId());

    if (existingOpt.isPresent()) {
      ExperienceReaction existing = existingOpt.get();
      if (existing.getEmoji().equals(request.emoji())) {
        this.experienceReactionRepository.delete(existing);
      } else {
        existing.setEmoji(request.emoji());
        this.experienceReactionRepository.save(existing);
      }
    } else {
      ExperienceReaction reaction = new ExperienceReaction(null, id, request.deviceId(), request.emoji());
      this.experienceReactionRepository.save(reaction);
    }
  }
}