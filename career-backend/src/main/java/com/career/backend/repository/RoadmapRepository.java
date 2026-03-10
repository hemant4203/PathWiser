package com.career.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.career.backend.entity.Roadmap;

public interface RoadmapRepository 
        extends JpaRepository<Roadmap, Long> {
	
	 Optional<Roadmap> findByIdAndDeletedFalse(Long id);

	 Page<Roadmap> findAllByDeletedFalse(Pageable pageable);
	
	 @Query("SELECT COALESCE(MAX(r.displayOrder), 0) FROM Roadmap r WHERE r.deleted = false")
	 Integer findMaxDisplayOrderForActive();
	 
	 @Query("""
			 SELECT r FROM Roadmap r
			 WHERE r.deleted = false
			 ORDER BY
			 CASE r.roadmapLevel
			     WHEN 'Beginner' THEN 1
			     WHEN 'Intermediate' THEN 2
			     WHEN 'Advanced' THEN 3
			 END ASC
			 """)
			 Page<Roadmap> findAllByDeletedFalseOrderByLevelAsc(Pageable pageable);


			 @Query("""
			 SELECT r FROM Roadmap r
			 WHERE r.deleted = false
			 ORDER BY
			 CASE r.roadmapLevel
			     WHEN 'Beginner' THEN 1
			     WHEN 'Intermediate' THEN 2
			     WHEN 'Advanced' THEN 3
			 END DESC
			 """)
			 Page<Roadmap> findAllByDeletedFalseOrderByLevelDesc(Pageable pageable);
	
	long countByDeletedFalse();
}
