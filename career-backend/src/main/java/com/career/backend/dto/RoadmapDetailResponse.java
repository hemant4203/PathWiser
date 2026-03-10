package com.career.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RoadmapDetailResponse {

    private Long id;
    private String title;
    private String level;
    private String structureJson;
    private Integer estimatedDurationMonths;
    private Integer salaryMin;
    private Integer salaryMax;
    private String requiredSkills;
    private String highlightTags;
}

