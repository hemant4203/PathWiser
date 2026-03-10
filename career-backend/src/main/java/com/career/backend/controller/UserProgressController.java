package com.career.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.career.backend.dto.ActiveRoadmapResponse;
import com.career.backend.dto.ProgressResponse;
import com.career.backend.dto.UserProfileDto;
import com.career.backend.entity.User;
import com.career.backend.repository.UserRepository;
import com.career.backend.service.UserProgressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','ADMIN')")
public class UserProgressController {

	@Autowired
    private final UserProgressService userProgressService;
    
    @Autowired
    private UserRepository userRepository;

    // ==========================
    // START ROADMAP
    // ==========================
    @PostMapping("/roadmaps/{roadmapId}/start")
    public void startRoadmap(@PathVariable Long roadmapId) {
        userProgressService.startRoadmap(roadmapId);
    }

    // ==========================
    // COMPLETE SUBTOPIC
    // ==========================
    @PostMapping("/progress/{roadmapId}/{subtopicId}")
    public ProgressResponse completeSubtopic(
            @PathVariable Long roadmapId,
            @PathVariable String subtopicId) {

        return userProgressService
                .completeSubtopic(roadmapId, subtopicId);
    }

    // ==========================
    // GET PROGRESS
    // ==========================
    @GetMapping("/progress/{roadmapId}")
    public ProgressResponse getProgress(
            @PathVariable Long roadmapId) {

        return userProgressService
                .getProgress(roadmapId);
    }
    
    @GetMapping("/roadmap/active")
    public ActiveRoadmapResponse getActiveRoadmap() {

        System.out.println("ACTIVE ROADMAP ENDPOINT HIT");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authorities: " + auth.getAuthorities());

        return userProgressService.getActiveRoadmap();
    }
    
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileDto profile = userProgressService.getUserProfile(user);

        return ResponseEntity.ok(profile);
    }
}