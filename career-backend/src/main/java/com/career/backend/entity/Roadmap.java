package com.career.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "roadmap")
@Data
public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "roadmap_seq")
    @SequenceGenerator(
            name = "roadmap_seq",
            sequenceName = "roadmap_seq",
            allocationSize = 1
    )
    private Long id;

    private String title;

    @Column(name = "roadmap_level")
    private String roadmapLevel;

    @Lob
    @Column(name = "structure_json")
    private String structureJson;

    // 🔽 NEW FIELDS
    @Column(nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    @Column(name = "estimated_duration_months")
    private Integer estimatedDurationMonths;

    @Column(name = "salary_min")
    private Integer salaryMin;

    @Column(name = "salary_max")
    private Integer salaryMax;

    @Column(name = "required_skills")
    private String requiredSkills;

    @Column(name = "highlight_tags")
    private String highlightTags;
}
