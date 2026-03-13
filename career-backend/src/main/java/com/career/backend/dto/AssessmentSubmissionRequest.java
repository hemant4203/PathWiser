package com.career.backend.dto;

import lombok.Data;

@Data
public class AssessmentSubmissionRequest {

    private String githubLink;

    private String liveLink;

    private String externalLink;

    private String fileUrl;

    private String videoLink;

}