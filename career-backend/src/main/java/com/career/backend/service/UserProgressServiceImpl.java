package com.career.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.career.backend.dto.ActiveRoadmapResponse;
import com.career.backend.dto.ProgressResponse;
import com.career.backend.dto.UserProfileDto;
import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.entity.UserProgress;
import com.career.backend.entity.UserRoadmap;
import com.career.backend.errors.ResourceNotFoundException;
import com.career.backend.repository.RoadmapRepository;
import com.career.backend.repository.UserProgressRepository;
import com.career.backend.repository.UserRepository;
import com.career.backend.repository.UserRoadmapRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserProgressServiceImpl implements UserProgressService {

    private final UserRepository userRepository;
    private final RoadmapRepository roadmapRepository;
    private final UserRoadmapRepository userRoadmapRepository;
    private final UserProgressRepository userProgressRepository;
    private final ObjectMapper objectMapper;

    // ===============================
    // START ROADMAP
    // ===============================
    @Override
    public void startRoadmap(Long roadmapId) {

        User user = getCurrentUser();

        Roadmap roadmap = roadmapRepository.findByIdAndDeletedFalse(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Roadmap not found"));

        boolean hasActive = userRoadmapRepository
                .existsByUserAndCompletedAtIsNull(user);

        if (hasActive) {
            throw new IllegalStateException(
                    "User already has an active roadmap");
        }

        boolean alreadyStarted = userRoadmapRepository
                .existsByUserAndRoadmap(user, roadmap);

        if (alreadyStarted) {
            throw new IllegalStateException(
                    "Roadmap already started");
        }

        UserRoadmap userRoadmap = new UserRoadmap();
        userRoadmap.setUser(user);
        userRoadmap.setRoadmap(roadmap);
        userRoadmap.setStartedAt(LocalDateTime.now());

        userRoadmapRepository.save(userRoadmap);
    }

    // ===============================
    // COMPLETE SUBTOPIC (WITH SEQUENTIAL LOGIC)
    // ===============================
    @Override
    public ProgressResponse completeSubtopic(Long roadmapId,
                                             String subtopicId) {

        User user = getCurrentUser();

        Roadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Roadmap not found"));

        userRoadmapRepository
                .findByUserAndRoadmap(user, roadmap)
                .orElseThrow(() ->
                        new IllegalStateException("Roadmap not started"));

        // 1️⃣ Extract ordered subtopics
        List<String> orderedIds =
                getOrderedSubtopicIds(roadmap.getId());

        if (!orderedIds.contains(subtopicId)) {
            throw new IllegalArgumentException("Invalid subtopic ID");
        }

        // 2️⃣ Get completed subtopics from DB
        List<UserProgress> completedProgress =
                userProgressRepository.findByUserAndRoadmap(user, roadmap);

        Set<String> completedIds =
                completedProgress.stream()
                        .map(UserProgress::getSubtopicId)
                        .collect(Collectors.toSet());

        // 3️⃣ Duplicate check
        if (completedIds.contains(subtopicId)) {
            throw new IllegalStateException(
                    "Subtopic already completed");
        }

        // 4️⃣ Sequential validation
        validateSequentialUnlock(
                subtopicId, orderedIds, completedIds);

        // 5️⃣ Save progress
        UserProgress progress = new UserProgress();
        progress.setUser(user);
        progress.setRoadmap(roadmap);
        progress.setSubtopicId(subtopicId);
        progress.setCompletedAt(LocalDateTime.now());

        userProgressRepository.save(progress);

        return buildProgressResponse(user, roadmap);
    }

    // ===============================
    // GET PROGRESS
    // ===============================
    @Override
    public ProgressResponse getProgress(Long roadmapId) {

        User user = getCurrentUser();

        Roadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Roadmap not found"));

        userRoadmapRepository
                .findByUserAndRoadmap(user, roadmap)
                .orElseThrow(() ->
                        new IllegalStateException("Roadmap not started"));

        return buildProgressResponse(user, roadmap);
    }

    // ===============================
    // HELPER METHODS
    // ===============================

    private User getCurrentUser() {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalStateException("User not found"));
    }

    private ProgressResponse buildProgressResponse(User user,
                                                   Roadmap roadmap) {

        int total = getOrderedSubtopicIds(roadmap.getId()).size();

        long completed =
                userProgressRepository
                        .countByUserAndRoadmap(user, roadmap);

        double percent = total == 0
                ? 0
                : (completed * 100.0) / total;

        percent = Math.round(percent * 100.0) / 100.0;

        // Auto mark roadmap complete
        if (percent == 100.0) {
            userRoadmapRepository
                    .findByUserAndRoadmap(user, roadmap)
                    .ifPresent(ur -> {
                        if (ur.getCompletedAt() == null) {
                            ur.setCompletedAt(
                                    LocalDateTime.now());
                        }
                    });
        }

        return ProgressResponse.builder()
                .roadmapId(roadmap.getId())
                .roadmapTitle(roadmap.getTitle())
                .totalSubtopics(total)
                .completedSubtopics((int) completed)
                .progressPercentage(percent)
                .completed(percent == 100.0)
                .build();
    }

    @Cacheable(value = "roadmapStructure", key = "#roadmapId")
    public List<String> getOrderedSubtopicIds(Long roadmapId) {

        Roadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Roadmap not found"));

        try {
            JsonNode root = objectMapper.readTree(roadmap.getStructureJson());
            List<String> orderedIds = new ArrayList<>();

            if (root.isArray()) {
                // Your current DB format
                for (JsonNode module : root) {
                    for (JsonNode topic : module.path("topics")) {
                        for (JsonNode sub : topic.path("subtopics")) {
                            orderedIds.add(sub.path("id").asText());
                        }
                    }
                }
            } else {
                // Future-proof if you ever wrap it with { "modules": [...] }
                for (JsonNode module : root.path("modules")) {
                    for (JsonNode topic : module.path("topics")) {
                        for (JsonNode sub : topic.path("subtopics")) {
                            orderedIds.add(sub.path("id").asText());
                        }
                    }
                }
            }

            return orderedIds;

        } catch (Exception e) {
            throw new IllegalStateException("Invalid roadmap structure JSON");
        }
    }

    private void validateSequentialUnlock(
            String targetSubtopicId,
            List<String> orderedIds,
            Set<String> completedIds) {

        int targetIndex =
                orderedIds.indexOf(targetSubtopicId);

        if (targetIndex == -1) {
            throw new ResourceNotFoundException(
                    "Subtopic not found in roadmap");
        }

        if (targetIndex == 0) {
            return; // first always allowed
        }

        for (int i = 0; i < targetIndex; i++) {
            if (!completedIds.contains(
                    orderedIds.get(i))) {

                throw new IllegalStateException(
                        "Previous subtopics must be completed before unlocking this one");
            }
        }
    }
    
    @Override
    public ActiveRoadmapResponse getActiveRoadmap() {

        User user = getCurrentUser();
        
        System.out.println("Active roadmap check for user: " + user.getUsername());
        System.out.println("User ID: " + user.getId());

        System.out.println("Current User ID: " + user.getId());
        System.out.println("Current Username: " + user.getUsername());
        
        UserRoadmap userRoadmap =
                userRoadmapRepository
                        .findByUserIdAndCompletedAtIsNull(user.getId())
                        .orElseThrow(() ->
                                new IllegalStateException("No active roadmap"));

        Roadmap roadmap = userRoadmap.getRoadmap();

        ProgressResponse progress =
                buildProgressResponse(user, roadmap);

        List<UserProgress> progressList =
                userProgressRepository.findByUserAndRoadmap(user, roadmap);

        List<String> completedIds =
                progressList.stream()
                        .map(UserProgress::getSubtopicId)
                        .toList();

        return ActiveRoadmapResponse.builder()
                .roadmapId(roadmap.getId())
                .title(roadmap.getTitle())
                .level(roadmap.getRoadmapLevel())
                .structureJson(roadmap.getStructureJson())
                .estimatedDurationMonths(roadmap.getEstimatedDurationMonths())
                .salaryMin(roadmap.getSalaryMin())
                .salaryMax(roadmap.getSalaryMax())
                .requiredSkills(roadmap.getRequiredSkills())
                .highlightTags(roadmap.getHighlightTags())
                .progress(progress)
                .completedSubtopicIds(completedIds)
                .build();
    }
    
    @Override
    public UserProfileDto getUserProfile(User user) {

        UserProfileDto dto = new UserProfileDto();

        dto.setUsername(user.getUsername());

        Optional<UserRoadmap> activeRoadmap =
                userRoadmapRepository.findByUserIdAndCompletedAtIsNull(user.getId());

        if (activeRoadmap.isPresent()) {

            Roadmap roadmap = activeRoadmap.get().getRoadmap();

            dto.setActiveRoadmapTitle(roadmap.getTitle());

            long completedSubtopics =
                    userProgressRepository.countByUserAndRoadmap(user, roadmap);

            dto.setCompletedSubtopics(completedSubtopics);

            List<UserProgress> progressList =
                    userProgressRepository.findByUserAndRoadmap(user, roadmap);

            progressList.sort((a, b) -> b.getCompletedAt().compareTo(a.getCompletedAt()));

            List<String> recent =
                    progressList.stream()
                            .limit(3)
                            .map(UserProgress::getSubtopicId)
                            .toList();

            dto.setRecentCompletedSubtopics(recent);
            
            List<UserRoadmap> completedRoadmaps =
                    userRoadmapRepository.findByUserAndCompletedAtIsNotNull(user);

            List<String> completedTitles =
                    completedRoadmaps.stream()
                            .map(ur -> ur.getRoadmap().getTitle())
                            .toList();

            dto.setCompletedRoadmapTitles(completedTitles);
        }

        int completedRoadmaps =
                (int) userRoadmapRepository.countByUserAndCompletedAtIsNotNull(user);

        dto.setCompletedRoadmaps(completedRoadmaps);

        return dto;
    }
}