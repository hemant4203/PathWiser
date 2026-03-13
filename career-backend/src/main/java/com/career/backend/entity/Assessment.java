package com.career.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "assessments")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"roadmap"})
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "assessment_seq")
    @SequenceGenerator(
            name = "assessment_seq",
            sequenceName = "assessment_sequence",
            allocationSize = 1
    )
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(nullable = false)
    private String title;

    @Lob
    private String description;

    @Column(name = "REQUIRES_GITHUB")
    private boolean requiresGithub;

    @Column(name = "REQUIRES_LIVE_LINK")
    private boolean requiresLiveLink;

    @Column(name = "REQUIRES_EXTERNAL_LINK")
    private boolean requiresExternalLink;

    @Column(name = "REQUIRES_FILE")
    private boolean requiresFile;

    @Column(name = "REQUIRES_VIDEO_LINK")
    private boolean requiresVideoLink;
}