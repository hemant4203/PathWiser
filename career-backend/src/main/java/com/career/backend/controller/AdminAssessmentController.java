package com.career.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.career.backend.dto.AdminAssessmentSubmissionDTO;
import com.career.backend.dto.RejectSubmissionRequest;
import com.career.backend.service.AdminAssessmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/assessments")
@RequiredArgsConstructor
public class AdminAssessmentController {

    private final AdminAssessmentService adminAssessmentService;

    @GetMapping("/pending")
    public List<AdminAssessmentSubmissionDTO> getPendingSubmissions() {

        return adminAssessmentService.getPendingSubmissions();

    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<String> rejectSubmission(
            @PathVariable Long id,
            @RequestBody RejectSubmissionRequest request) {

        adminAssessmentService.rejectSubmission(id, request.getComment());

        return ResponseEntity.ok("Submission rejected successfully");
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<String> approveSubmission(@PathVariable Long id) {

        adminAssessmentService.approveSubmission(id);

        return ResponseEntity.ok("Submission approved successfully");
    }
}