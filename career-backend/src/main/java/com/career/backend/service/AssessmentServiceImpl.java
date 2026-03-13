package com.career.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.career.backend.dto.AssessmentResponse;
import com.career.backend.dto.AssessmentSubmissionRequest;
import com.career.backend.entity.Assessment;
import com.career.backend.entity.AssessmentSubmission;
import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.entity.UserRoadmap;
import com.career.backend.errors.ResourceNotFoundException;
import com.career.backend.model.RoadmapStatus;
import com.career.backend.model.SubmissionStatus;
import com.career.backend.repository.AssessmentRepository;
import com.career.backend.repository.AssessmentSubmissionRepository;
import com.career.backend.repository.RoadmapRepository;
import com.career.backend.repository.UserRepository;
import com.career.backend.repository.UserRoadmapRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AssessmentServiceImpl implements AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentSubmissionRepository submissionRepository;
    private final RoadmapRepository roadmapRepository;
    private final UserRepository userRepository;
    private final UserRoadmapRepository userRoadmapRepository;

    private User getCurrentUser() {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalStateException("User not found"));
    }

    // ===============================
    // GET ASSESSMENT
    // ===============================
    @Override
    public AssessmentResponse getAssessment(Long roadmapId) {

        User user = getCurrentUser();

        Roadmap roadmap = roadmapRepository
                .findByIdAndDeletedFalse(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Roadmap not found"));

        UserRoadmap userRoadmap = userRoadmapRepository
                .findByUserIdAndRoadmapId(user.getId(), roadmap.getId())
                .orElseThrow(() ->
                        new IllegalStateException("Roadmap not started"));

        // User must finish roadmap first
        if (userRoadmap.getStatus() != RoadmapStatus.ASSESSMENT_UNLOCKED &&
            userRoadmap.getStatus() != RoadmapStatus.ASSESSMENT_PENDING &&
            userRoadmap.getStatus() != RoadmapStatus.REJECTED) {

            throw new IllegalStateException("Assessment not unlocked yet");
        }

        Assessment assessment = assessmentRepository
                .findByRoadmap(roadmap)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Assessment not found"));

        return AssessmentResponse.builder()
                .assessmentId(assessment.getId())
                .title(assessment.getTitle())
                .description(assessment.getDescription())
                .requiresGithub(assessment.isRequiresGithub())
                .requiresLiveLink(assessment.isRequiresLiveLink())
                .requiresExternalLink(assessment.isRequiresExternalLink())
                .requiresFile(assessment.isRequiresFile())
                .requiresVideoLink(assessment.isRequiresVideoLink())
                .build();
    }

    // ===============================
    // SUBMIT ASSESSMENT
    // ===============================
    @Override
    public void submitAssessment(Long roadmapId,
                                 AssessmentSubmissionRequest request) {

        User user = getCurrentUser();

        Roadmap roadmap = roadmapRepository
                .findByIdAndDeletedFalse(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Roadmap not found"));

        Assessment assessment = assessmentRepository
                .findByRoadmapId(roadmap.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Assessment not found"));

        UserRoadmap userRoadmap = userRoadmapRepository
                .findByUserAndRoadmap(user, roadmap)
                .orElseThrow(() ->
                        new IllegalStateException("Roadmap not started"));

        Optional<AssessmentSubmission> existingSubmission =
                submissionRepository.findByUserAndAssessment(user, assessment);

        boolean rejectedSubmission =
                existingSubmission.isPresent() &&
                existingSubmission.get().getStatus() == SubmissionStatus.REJECTED;

        if (userRoadmap.getStatus() != RoadmapStatus.ASSESSMENT_UNLOCKED && !rejectedSubmission) {
            throw new IllegalStateException("Assessment not unlocked");
        }

        // Handle resubmission
        if (rejectedSubmission) {

            AssessmentSubmission existing = existingSubmission.get();

            existing.setGithubLink(request.getGithubLink());
            existing.setLiveLink(request.getLiveLink());
            existing.setExternalLink(request.getExternalLink());
            existing.setFileUrl(request.getFileUrl());
            existing.setVideoLink(request.getVideoLink());

            existing.setStatus(SubmissionStatus.PENDING);
            existing.setSubmittedAt(LocalDateTime.now());
            existing.setReviewedAt(null);

            submissionRepository.save(existing);

            userRoadmap.setStatus(RoadmapStatus.ASSESSMENT_PENDING);
            userRoadmapRepository.save(userRoadmap);

            return;
        }

        // Validate required inputs
        if (assessment.isRequiresGithub() &&
                (request.getGithubLink() == null || request.getGithubLink().isBlank())) {

            throw new IllegalArgumentException("GitHub link is required");
        }

        if (assessment.isRequiresLiveLink() &&
                (request.getLiveLink() == null || request.getLiveLink().isBlank())) {

            throw new IllegalArgumentException("Live deployment link is required");
        }

        if (assessment.isRequiresExternalLink() &&
                (request.getExternalLink() == null || request.getExternalLink().isBlank())) {

            throw new IllegalArgumentException("External link is required");
        }

        if (assessment.isRequiresFile() &&
                (request.getFileUrl() == null || request.getFileUrl().isBlank())) {

            throw new IllegalArgumentException("File upload is required");
        }

        if (assessment.isRequiresVideoLink() &&
                (request.getVideoLink() == null || request.getVideoLink().isBlank())) {

            throw new IllegalArgumentException("Video link is required");
        }

        AssessmentSubmission submission = new AssessmentSubmission();

        submission.setUser(user);
        submission.setRoadmap(roadmap);
        submission.setAssessment(assessment);

        submission.setGithubLink(request.getGithubLink());
        submission.setLiveLink(request.getLiveLink());
        submission.setExternalLink(request.getExternalLink());
        submission.setFileUrl(request.getFileUrl());
        submission.setVideoLink(request.getVideoLink());

        submission.setStatus(SubmissionStatus.PENDING);
        submission.setSubmittedAt(LocalDateTime.now());

        submissionRepository.save(submission);

        userRoadmap.setStatus(RoadmapStatus.ASSESSMENT_PENDING);
        userRoadmapRepository.save(userRoadmap);
    }
}