package com.career.backend.entity;

import java.time.LocalDateTime;


import jakarta.persistence.Column;
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
@Table(name = "user_progress")
@Data
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_progress_seq")
    @SequenceGenerator(
            name = "user_progress_seq",
            sequenceName = "user_progress_sequence",
            allocationSize = 1
    )
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(nullable = false)
    private String subtopicId;

    private LocalDateTime completedAt;
}