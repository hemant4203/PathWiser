package com.career.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompareRoadmapDTO {

    private Long id;
    private String title;
    private String level;

    private Integer totalModules;
    private Integer totalTopics;

    private Integer estimatedDurationMonths;
    private Integer salaryMin;
    private Integer salaryMax;

    private String requiredSkills;
    private String highlightTags;
}