package com.career.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.career.backend.entity.Assessment;
import com.career.backend.entity.Roadmap;

public interface AssessmentRepository 
        extends JpaRepository<Assessment, Long> {

    Optional<Assessment> findByRoadmap(Roadmap roadmap);

    Optional<Assessment> findByRoadmapId(Long roadmapId);
}