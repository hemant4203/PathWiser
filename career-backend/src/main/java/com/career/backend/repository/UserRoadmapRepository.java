package com.career.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.entity.UserRoadmap;


public interface UserRoadmapRepository extends JpaRepository<UserRoadmap, Long> {

	Optional<UserRoadmap> findByUserIdAndCompletedAtIsNull(Long userId);
    
    boolean existsByUserAndCompletedAtIsNull(User user);

    boolean existsByUserAndRoadmap(User user, Roadmap roadmap);
    
    
    Optional<UserRoadmap> findByUserAndRoadmap(User user, Roadmap roadmap);
    
    boolean existsByRoadmap(Roadmap roadmap);
    
    long countByUserAndCompletedAtIsNotNull(User user);
    
    List<UserRoadmap> findByUserAndCompletedAtIsNotNull(User user);
}
