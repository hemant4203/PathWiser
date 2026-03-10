package com.career.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RoadmapRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Level is required")
    private String level;

    @NotBlank(message = "Structure JSON is required")
    private String structureJson;

    private Integer estimatedDurationMonths;
    private Integer salaryMin;
    private Integer salaryMax;
    private String requiredSkills;
    private String highlightTags;
}