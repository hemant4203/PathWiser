package com.career.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminStatsDto {

    private long totalUsers;

    private long activeRoadmaps;

    private long totalEnrollments;

    private List<AdminActivityDto> recentActivity;
}