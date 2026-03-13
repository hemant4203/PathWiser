package com.career.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.career.backend.entity.Assessment;
import com.career.backend.entity.AssessmentSubmission;
import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.model.SubmissionStatus;

public interface AssessmentSubmissionRepository
        extends JpaRepository<AssessmentSubmission, Long> {

    Optional<AssessmentSubmission> findByUserAndAssessment(
            User user,
            Assessment assessment
    );

    List<AssessmentSubmission> findByStatus(SubmissionStatus status);
    
    Optional<AssessmentSubmission> findByUserAndRoadmap(User user, Roadmap roadmap);
}