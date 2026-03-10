package com.career.backend.dto;

import lombok.Data;

@Data
public class UpdateRoadmapRequest {

	private String title;
	private String level;
	private String structureJson;
	private Integer estimatedDurationMonths;
	private Integer salaryMin;
	private Integer salaryMax;
	private String requiredSkills;
	private String highlightTags;
	
}
