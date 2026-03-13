package com.career.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CompletedRoadmapDto {

    private Long roadmapId;
    private String title;
}