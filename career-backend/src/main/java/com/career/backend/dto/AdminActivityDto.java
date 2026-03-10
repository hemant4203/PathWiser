package com.career.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminActivityDto {

    private String username;

    private String roadmapTitle;

    private String subtopicId;

    private LocalDateTime completedAt;
}