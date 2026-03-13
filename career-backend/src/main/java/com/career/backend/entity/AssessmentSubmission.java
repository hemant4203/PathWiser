package com.career.backend.entity;

import java.time.LocalDateTime;

import com.career.backend.model.SubmissionStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
@Table(name = "assessment_submissions")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"user","roadmap","assessment"})
public class AssessmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "assessment_submission_seq")
    @SequenceGenerator(
            name = "assessment_submission_seq",
            sequenceName = "assessment_submission_sequence",
            allocationSize = 1
    )
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "roadmap_id")
    @JsonIgnore
    private Roadmap roadmap;

    @ManyToOne(optional = false)
    @JoinColumn(name = "assessment_id")
    @JsonIgnore
    private Assessment assessment;

    private String githubLink;

    private String liveLink;

    private String externalLink;

    private String fileUrl;

    private String videoLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubmissionStatus status;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;
    
    @Column(name = "review_comment")
    private String reviewComment;
}