package com.career.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_bookmarks")
@Data
public class UserBookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_bookmark_seq")
    @SequenceGenerator(
            name = "user_bookmark_seq",
            sequenceName = "user_bookmark_sequence",
            allocationSize = 1
    )
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}