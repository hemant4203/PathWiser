package com.career.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompareResponseDTO {

    private CompareRoadmapDTO first;
    private CompareRoadmapDTO second;
}