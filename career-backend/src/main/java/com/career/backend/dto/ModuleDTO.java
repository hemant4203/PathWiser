package com.career.backend.dto;

import java.util.List;
import lombok.Data;

@Data
public class ModuleDTO {

    private String id;   // NEW

    private String title;

    private String description;

    private List<TopicDTO> topics;
}