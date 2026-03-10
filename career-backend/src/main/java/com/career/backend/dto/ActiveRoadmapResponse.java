package com.career.backend.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActiveRoadmapResponse {

    private Long roadmapId;
    private String title;
    private String level;

    private String structureJson;

    private Integer estimatedDurationMonths;
    private Integer salaryMin;
    private Integer salaryMax;
    private String requiredSkills;
    private String highlightTags;

    private ProgressResponse progress;

    private List<String> completedSubtopicIds;
}