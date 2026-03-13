package com.career.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.entity.UserRoadmap;
import com.career.backend.model.RoadmapStatus;


public interface UserRoadmapRepository extends JpaRepository<UserRoadmap, Long> {

	Optional<UserRoadmap> findFirstByUserIdAndCompletedAtIsNullOrderByStartedAtDesc(Long userId);
    
    boolean existsByUserAndCompletedAtIsNull(User user);

    boolean existsByUserAndRoadmap(User user, Roadmap roadmap);
    
    
    Optional<UserRoadmap> findByUserAndRoadmap(User user, Roadmap roadmap);
    
    boolean existsByRoadmap(Roadmap roadmap);
    
    long countByUserAndCompletedAtIsNotNull(User user);

    /*~~(class org.openrewrite.java.tree.J$Erroneous cannot be cast to class org.openrewrite.java.tree.J$Assignment (org.openrewrite.java.tree.J$Erroneous and org.openrewrite.java.tree.J$Assignment are in unnamed module of loader 'app'))~~>*/@Query("SELECT u FROM UserRoadmap u WHERE u.user = :user AND u.completedAt IS NOT NULL")
    List<UserRoadmap> findByUserAndCompletedAtIsNotNull(User user);
    
    boolean existsByUserAndStatusIn(User user, List<RoadmapStatus> statuses);
    
    List<UserRoadmap> findByUser(User user);
    
    List<UserRoadmap> findByStatus(RoadmapStatus status);
    
    Optional<UserRoadmap> findByUserIdAndRoadmapId(Long userId, Long roadmapId);
}
