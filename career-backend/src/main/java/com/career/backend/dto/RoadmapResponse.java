package com.career.backend.dto;

import lombok.Data;

@Data
public class RoadmapResponse {

    private Long id;
    private String title;
    private String level;
    private String structureJson;   
    private boolean deleted;
    private Integer estimatedDurationMonths;
    private Integer salaryMin;
    private Integer salaryMax;
    private String requiredSkills;
    private String highlightTags;

    public RoadmapResponse(Long id, String title, String level, boolean deleted) {
        this.id = id;
        this.title = title;
        this.level = level;
        this.deleted = deleted;	
    }

	public RoadmapResponse() {
		// TODO Auto-generated constructor stub
	}
}


