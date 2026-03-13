package com.career.backend.service;

import java.util.List;

import com.career.backend.dto.AdminAssessmentSubmissionDTO;

public interface AdminAssessmentService {

	List<AdminAssessmentSubmissionDTO> getPendingSubmissions();
    
    void rejectSubmission(Long submissionId, String reviewComment);
    
    void approveSubmission(Long submissionId);

}