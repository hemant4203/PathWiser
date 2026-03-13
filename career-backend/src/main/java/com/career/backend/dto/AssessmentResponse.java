package com.career.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssessmentResponse {

    private Long assessmentId;

    private String title;

    private String description;

    private boolean requiresGithub;

    private boolean requiresLiveLink;

    private boolean requiresExternalLink;

    private boolean requiresFile;

    private boolean requiresVideoLink;

}