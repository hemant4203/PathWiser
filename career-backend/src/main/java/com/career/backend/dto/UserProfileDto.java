package com.career.backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class UserProfileDto {

    private String username;

    private String activeRoadmapTitle;

    private Long completedSubtopics;

    private Long totalSubtopics;

    private Integer progressPercentage;

    private Integer completedRoadmaps;

    private List<String> recentCompletedSubtopics;
    
    private List<CompletedRoadmapDto> completedRoadmapsList;

}
