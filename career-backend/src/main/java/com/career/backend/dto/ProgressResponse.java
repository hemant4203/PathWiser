package com.career.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressResponse {

    private Long roadmapId;
    private String roadmapTitle;

    private int totalSubtopics;
    private int completedSubtopics;

    private double progressPercentage;

    private boolean completed;

    private String username;

}
