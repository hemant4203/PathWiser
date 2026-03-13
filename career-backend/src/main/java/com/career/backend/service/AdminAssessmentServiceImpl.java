package com.career.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.career.backend.dto.AdminAssessmentSubmissionDTO;
import com.career.backend.entity.AssessmentSubmission;
import com.career.backend.entity.UserRoadmap;
import com.career.backend.errors.ResourceNotFoundException;
import com.career.backend.model.RoadmapStatus;
import com.career.backend.model.SubmissionStatus;
import com.career.backend.repository.AssessmentSubmissionRepository;
import com.career.backend.repository.UserRoadmapRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminAssessmentServiceImpl implements AdminAssessmentService {

    private final AssessmentSubmissionRepository submissionRepository;
    private final UserRoadmapRepository userRoadmapRepository;

    
    
    @Override
    public void rejectSubmission(Long submissionId, String reviewComment) {

        AssessmentSubmission submission = submissionRepository
                .findById(submissionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Submission not found"));

        submission.setStatus(SubmissionStatus.REJECTED);
        submission.setReviewedAt(LocalDateTime.now());
        submission.setReviewComment(reviewComment);

        submissionRepository.save(submission);

        UserRoadmap userRoadmap = userRoadmapRepository
        		.findByUserIdAndRoadmapId(submission.getUser().getId(), submission.getRoadmap().getId())
                .orElseThrow(() ->
                        new IllegalStateException("User roadmap not found"));

        userRoadmap.setStatus(RoadmapStatus.REJECTED);

        userRoadmapRepository.save(userRoadmap);
    }



	@Override
	public List<AdminAssessmentSubmissionDTO> getPendingSubmissions() {
		// TODO Auto-generated method stub
		return submissionRepository.findByStatus(SubmissionStatus.PENDING)
		        .stream()
		        .map(submission -> AdminAssessmentSubmissionDTO.builder()
		                .id(submission.getId())
		                .username(submission.getUser().getUsername())
		                .roadmapTitle(submission.getRoadmap().getTitle())
		                .githubLink(submission.getGithubLink())
		                .liveLink(submission.getLiveLink())
		                .videoLink(submission.getVideoLink())
		                .submittedAt(submission.getSubmittedAt())
		                .status(submission.getStatus().name())
		                .build())
		        .toList();
	}
	
	@Override
	public void approveSubmission(Long submissionId) {

	    AssessmentSubmission submission = submissionRepository
	            .findById(submissionId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Submission not found"));

	    submission.setStatus(SubmissionStatus.APPROVED);
	    submission.setReviewedAt(LocalDateTime.now());

	    UserRoadmap userRoadmap = userRoadmapRepository
	            .findByUserAndRoadmap(
	                    submission.getUser(),
	                    submission.getRoadmap()
	            )
	            .orElseThrow(() ->
	                    new IllegalStateException("User roadmap not found"));

	    userRoadmap.setStatus(RoadmapStatus.CERTIFIED);
	    userRoadmap.setCompletedAt(LocalDateTime.now());

	    // generate certificate id
	    String certificateId = UUID.randomUUID().toString();
	    userRoadmap.setCertificateId(certificateId);
	}
}