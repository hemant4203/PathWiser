package com.career.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NodeDetailResponse {

    private Long roadmapId;
    private String nodeId;
    private String type; // MODULE, TOPIC, SUBTOPIC

    private String title;
    private String description;

    // Only for TOPIC (visible only if roadmap started)
    private TopicResourcesDTO resources;

    // Only for SUBTOPIC
    private Boolean locked;
    private Boolean completed;
}