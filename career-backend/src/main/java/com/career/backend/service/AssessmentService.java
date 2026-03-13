package com.career.backend.service;

import java.util.List;

import com.career.backend.dto.AssessmentResponse;
import com.career.backend.dto.AssessmentSubmissionRequest;
import com.career.backend.entity.AssessmentSubmission;

public interface AssessmentService {

    AssessmentResponse getAssessment(Long roadmapId);

    void submitAssessment(Long roadmapId,
                          AssessmentSubmissionRequest request);

   
}