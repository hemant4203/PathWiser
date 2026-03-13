package com.career.backend.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminAssessmentSubmissionDTO {

    private Long id;

    private String username;

    private String roadmapTitle;

    private String githubLink;

    private String liveLink;

    private String videoLink;

    private LocalDateTime submittedAt;

    private String status;

}