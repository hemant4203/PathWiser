package com.career.backend.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.career.backend.dto.AdminActivityDto;
import com.career.backend.dto.AdminStatsDto;
import com.career.backend.entity.UserProgress;
import com.career.backend.repository.RoadmapRepository;
import com.career.backend.repository.UserProgressRepository;
import com.career.backend.repository.UserRepository;
import com.career.backend.repository.UserRoadmapRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminStatsServiceImpl implements AdminStatsService {

    private final UserRepository userRepository;
    private final RoadmapRepository roadmapRepository;
    private final UserRoadmapRepository userRoadmapRepository;
    private final UserProgressRepository userProgressRepository;

    @Override
    public AdminStatsDto getDashboardStats() {

        long totalUsers = userRepository.count();

        long activeRoadmaps = roadmapRepository.countByDeletedFalse();

        long totalEnrollments = userRoadmapRepository.count();

        List<UserProgress> latest =
                userProgressRepository
                        .findAllByOrderByCompletedAtDesc(PageRequest.of(0, 10));

        List<AdminActivityDto> activity =
                latest.stream()
                        .map(p -> new AdminActivityDto(
                                p.getUser().getUsername(),
                                p.getRoadmap().getTitle(),
                                p.getSubtopicId(),
                                p.getCompletedAt()
                        ))
                        .toList();

        return new AdminStatsDto(
                totalUsers,
                activeRoadmaps,
                totalEnrollments,
                activity
        );
    }
}