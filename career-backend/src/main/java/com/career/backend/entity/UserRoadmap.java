package com.career.backend.entity;

import java.time.LocalDateTime;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "user_roadmaps")
@Data
public class UserRoadmap {

    @Id
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
}