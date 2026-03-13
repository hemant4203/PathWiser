package com.career.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.career.backend.dto.AssessmentResponse;
import com.career.backend.dto.AssessmentSubmissionRequest;
import com.career.backend.entity.AssessmentSubmission;
import com.career.backend.service.AssessmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/assessment")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @GetMapping("/{roadmapId}")
    public AssessmentResponse getAssessment(
            @PathVariable Long roadmapId) {

        return assessmentService.getAssessment(roadmapId);
    }

    @PostMapping("/{roadmapId}/submit")
    public void submitAssessment(
            @PathVariable Long roadmapId,
            @RequestBody AssessmentSubmissionRequest request) {

        assessmentService.submitAssessment(roadmapId, request);
    }
    
   
}