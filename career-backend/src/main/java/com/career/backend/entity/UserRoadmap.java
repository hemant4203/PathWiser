package com.career.backend.entity;

import java.time.LocalDateTime;

import com.career.backend.model.RoadmapStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "user_roadmaps")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)  // critical
@ToString(exclude = {"user", "roadmap"}) 
public class UserRoadmap {

    @Id
    @EqualsAndHashCode.Include 
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_roadmap_seq")
    @SequenceGenerator(
            name = "user_roadmap_seq",
            sequenceName = "user_roadmap_sequence",
            allocationSize = 1
    )
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "\"status\"", nullable = false, length = 30)
    private RoadmapStatus status = RoadmapStatus.IN_PROGRESS;
    
    @Column(name = "certificate_id", unique = true)
    private String certificateId;
}