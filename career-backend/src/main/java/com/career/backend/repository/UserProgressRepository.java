package com.career.backend.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.entity.UserProgress;


public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    boolean existsByUserAndRoadmapAndSubtopicId(User user,
                                                Roadmap roadmap,
                                                String subtopicId);

    long countByUserAndRoadmap(User user, Roadmap roadmap);
    
    List<UserProgress> findByUserAndRoadmap(User user, Roadmap roadmap);
    
    boolean existsByRoadmap(Roadmap roadmap);
    
    List<UserProgress> findAllByOrderByCompletedAtDesc(Pageable pageable);
}
