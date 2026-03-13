package com.career.backend.service;

import java.util.List;

import com.career.backend.dto.ActiveRoadmapResponse;
import com.career.backend.dto.ProgressResponse;
import com.career.backend.dto.UserProfileDto;
import com.career.backend.entity.User;

public interface UserProgressService {

    void startRoadmap(Long roadmapId);

    ProgressResponse completeSubtopic(Long roadmapId, String subtopicId);

    ProgressResponse getProgress(Long roadmapId);
    
    ActiveRoadmapResponse getActiveRoadmap();
    
    public UserProfileDto getUserProfile(User user);
    
    public List<ActiveRoadmapResponse> getUserRoadmaps();
    
    ActiveRoadmapResponse getRoadmapById(Long roadmapId);
    
}
