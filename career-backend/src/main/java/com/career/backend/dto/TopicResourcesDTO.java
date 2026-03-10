package com.career.backend.dto;

import java.util.List;
import lombok.Data;

@Data
public class TopicResourcesDTO {

    private List<ResourceDTO> free;
    private List<ResourceDTO> paid;
}