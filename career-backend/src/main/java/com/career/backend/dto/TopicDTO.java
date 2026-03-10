package com.career.backend.dto;

import java.util.List;
import lombok.Data;

@Data
public class TopicDTO {

    private String id;   // NEW

    private String title;

    private String description;

    private TopicResourcesDTO resources;

    private List<SubtopicDTO> subtopics;
}