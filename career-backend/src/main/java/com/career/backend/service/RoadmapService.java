package com.career.backend.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Collections;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.career.backend.dto.CompareResponseDTO;
import com.career.backend.dto.CompareRoadmapDTO;
import com.career.backend.dto.ModuleDTO;
import com.career.backend.dto.NodeDetailResponse;
import com.career.backend.dto.ResourceDTO;
import com.career.backend.dto.RoadmapDetailResponse;
import com.career.backend.dto.RoadmapRequest;
import com.career.backend.dto.RoadmapResponse;
import com.career.backend.dto.SubtopicDTO;
import com.career.backend.dto.TopicDTO;
import com.career.backend.dto.TopicResourcesDTO;
import com.career.backend.dto.UpdateRoadmapRequest;
import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.entity.UserProgress;
import com.career.backend.errors.ResourceNotFoundException;
import com.career.backend.repository.RoadmapRepository;
import com.career.backend.repository.UserProgressRepository;
import com.career.backend.repository.UserRepository;
import com.career.backend.repository.UserRoadmapRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;

@Service
public class RoadmapService {

	private final RoadmapRepository repository;
	private final UserRoadmapRepository userRoadmapRepository;
	private final UserProgressRepository userProgressRepository;
	private final UserRepository userRepository;
	private final ObjectMapper objectMapper;

	public RoadmapService(RoadmapRepository repository,
	                      UserRoadmapRepository userRoadmapRepository,
	                      UserProgressRepository userProgressRepository, UserRepository userRepository, ObjectMapper objectMapper) {
	    this.repository = repository;
	    this.userRoadmapRepository = userRoadmapRepository;
	    this.userProgressRepository = userProgressRepository;
	    this.userRepository = userRepository;
	    this.objectMapper = objectMapper;
	}
	
	public Page<RoadmapResponse> getAllRoadmaps(Pageable pageable,
            String sortBy,
            String direction) {

		Page<Roadmap> page;
		
		if ("level".equalsIgnoreCase(sortBy)) {
		
			// REMOVE pageable sort to avoid r.level error
			Pageable unsortedPageable =
			PageRequest.of(pageable.getPageNumber(),
			pageable.getPageSize());
			
			if ("desc".equalsIgnoreCase(direction)) {
			page = repository.findAllByDeletedFalseOrderByLevelDesc(unsortedPageable);
			} else {
			page = repository.findAllByDeletedFalseOrderByLevelAsc(unsortedPageable);
			}
		
		} else {
		page = repository.findAllByDeletedFalse(pageable);
		}
		
		return page.map(this::convertToResponse);
	}
    
    @Transactional
    public RoadmapResponse createRoadmap(RoadmapRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Request body cannot be null.");
        }

        // 🔥 Use correct field name
        validateStructure(request.getStructureJson());
        
        validateMetadata(
                request.getEstimatedDurationMonths(),
                request.getSalaryMin(),
                request.getSalaryMax()
        );

        Roadmap roadmap = new Roadmap();
        roadmap.setTitle(request.getTitle().trim());
        roadmap.setRoadmapLevel(request.getLevel().trim());
        roadmap.setStructureJson(request.getStructureJson());
        roadmap.setEstimatedDurationMonths(request.getEstimatedDurationMonths());
        roadmap.setSalaryMin(request.getSalaryMin());
        roadmap.setSalaryMax(request.getSalaryMax());
        roadmap.setRequiredSkills(request.getRequiredSkills());
        roadmap.setHighlightTags(request.getHighlightTags());

        Integer maxOrder = repository.findMaxDisplayOrderForActive();
        roadmap.setDisplayOrder(maxOrder + 1);

        Roadmap saved = repository.save(roadmap);

        return convertToResponse(saved);
    }
    
    @Cacheable(value = "roadmaps" , key = "#id")
    public RoadmapDetailResponse getRoadmapById(Long id) {

        Roadmap entity = repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found"));

        return convertToDetail(entity);
    }


    @CacheEvict(value = {"roadmaps", "roadmapStructure"}, key = "#id")
    public RoadmapResponse updateRoadmap(Long id, RoadmapRequest request) {

        Roadmap entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found with id: " + id));

        entity.setTitle(request.getTitle());
        entity.setRoadmapLevel(request.getLevel());
        entity.setStructureJson(request.getStructureJson());
        entity.setEstimatedDurationMonths(request.getEstimatedDurationMonths());
        entity.setSalaryMin(request.getSalaryMin());
        entity.setSalaryMax(request.getSalaryMax());
        entity.setRequiredSkills(request.getRequiredSkills());
        entity.setHighlightTags(request.getHighlightTags());
        validateMetadata(
                request.getEstimatedDurationMonths(),
                request.getSalaryMin(),
                request.getSalaryMax()
        );

        Roadmap updated = repository.save(entity);

        return convertToResponse(updated);
    }
    
    @CacheEvict(value = {"roadmaps", "roadmapStructure"}, key = "#id")
    @Transactional
    public void deleteRoadmap(Long id) {

        Roadmap entity = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Roadmap not found with id: " + id));

        entity.setDeleted(true);
        entity.setDeletedAt(LocalDateTime.now());

        repository.save(entity);
    }
    
    private RoadmapResponse convertToResponse(Roadmap entity) {

        RoadmapResponse response = new RoadmapResponse();
        response.setId(entity.getId());
        response.setTitle(entity.getTitle());
        response.setLevel(entity.getRoadmapLevel());
        response.setStructureJson(entity.getStructureJson());
        response.setDeleted(entity.isDeleted());
        response.setEstimatedDurationMonths(entity.getEstimatedDurationMonths());
        response.setSalaryMin(entity.getSalaryMin());
        response.setSalaryMax(entity.getSalaryMax());
        response.setRequiredSkills(entity.getRequiredSkills());
        response.setHighlightTags(entity.getHighlightTags());

        return response;
    }

    private RoadmapDetailResponse convertToDetail(Roadmap entity) {

        RoadmapDetailResponse response = new RoadmapDetailResponse();
        response.setId(entity.getId());
        response.setTitle(entity.getTitle());
        response.setLevel(entity.getRoadmapLevel());
        response.setStructureJson(entity.getStructureJson());
        response.setEstimatedDurationMonths(entity.getEstimatedDurationMonths());
        response.setSalaryMin(entity.getSalaryMin());
        response.setSalaryMax(entity.getSalaryMax());
        response.setRequiredSkills(entity.getRequiredSkills());
        response.setHighlightTags(entity.getHighlightTags());

        return response;
    }

    private void validateStructure(String structureJson) {

    if (structureJson == null || structureJson.isBlank()) {
        throw new IllegalArgumentException("Structure JSON cannot be empty.");
    }

    try {
        ObjectMapper mapper = new ObjectMapper();

        List<ModuleDTO> modules =
                mapper.readValue(structureJson,
                        new TypeReference<List<ModuleDTO>>() {});

        if (modules == null || modules.isEmpty()) {
            throw new IllegalArgumentException("Roadmap must contain at least one module.");
        }

        Set<String> subtopicIds = new HashSet<>();

        Pattern modulePattern = Pattern.compile("^M\\d+$");
        Pattern topicPattern = Pattern.compile("^M\\d+T\\d+$");
        Pattern subtopicPattern = Pattern.compile("^M\\d+T\\d+S\\d+$");

        for (ModuleDTO module : modules) {

            // ===== MODULE VALIDATION =====
            if (module.getId() == null || module.getId().isBlank()) {
                throw new IllegalArgumentException("Module ID cannot be empty.");
            }

            String moduleId = module.getId().trim();

            if (!modulePattern.matcher(moduleId).matches()) {
                throw new IllegalArgumentException(
                        "Invalid Module ID format: " + moduleId + ". Expected format: M1");
            }

            if (module.getTitle() == null || module.getTitle().isBlank()) {
                throw new IllegalArgumentException("Module title cannot be empty.");
            }

            if (module.getTopics() == null || module.getTopics().isEmpty()) {
                throw new IllegalArgumentException("Each module must contain topics.");
            }

            for (TopicDTO topic : module.getTopics()) {

                // ===== TOPIC VALIDATION =====
                if (topic.getId() == null || topic.getId().isBlank()) {
                    throw new IllegalArgumentException("Topic ID cannot be empty.");
                }

                String topicId = topic.getId().trim();

                if (!topicPattern.matcher(topicId).matches()) {
                    throw new IllegalArgumentException(
                            "Invalid Topic ID format: " + topicId + ". Expected format: M1T1");
                }

                if (!topicId.startsWith(moduleId)) {
                    throw new IllegalArgumentException(
                            "Topic ID " + topicId + " does not belong to module " + moduleId);
                }

                if (topic.getTitle() == null || topic.getTitle().isBlank()) {
                    throw new IllegalArgumentException("Topic title cannot be empty.");
                }

                if (topic.getSubtopics() == null || topic.getSubtopics().isEmpty()) {
                    throw new IllegalArgumentException("Each topic must contain subtopics.");
                }

                // ===== RESOURCE VALIDATION (TOPIC LEVEL) =====
                if (topic.getResources() != null) {

                    TopicResourcesDTO res = topic.getResources();

                    if (res.getFree() != null) {
                        for (ResourceDTO r : res.getFree()) {
                            if (r.getTitle() == null || r.getTitle().isBlank()) {
                                throw new IllegalArgumentException("Free resource title cannot be empty.");
                            }
                            if (r.getUrl() == null || r.getUrl().isBlank()) {
                                throw new IllegalArgumentException("Free resource URL cannot be empty.");
                            }
                        }
                    }

                    if (res.getPaid() != null) {
                        for (ResourceDTO r : res.getPaid()) {
                            if (r.getTitle() == null || r.getTitle().isBlank()) {
                                throw new IllegalArgumentException("Paid resource title cannot be empty.");
                            }
                            if (r.getUrl() == null || r.getUrl().isBlank()) {
                                throw new IllegalArgumentException("Paid resource URL cannot be empty.");
                            }
                        }
                    }
                }

                for (SubtopicDTO sub : topic.getSubtopics()) {

                    // ===== SUBTOPIC VALIDATION =====
                    if (sub.getId() == null || sub.getId().isBlank()) {
                        throw new IllegalArgumentException("Subtopic ID cannot be empty.");
                    }

                    String subtopicId = sub.getId().trim();

                    if (!subtopicPattern.matcher(subtopicId).matches()) {
                        throw new IllegalArgumentException(
                                "Invalid Subtopic ID format: " + subtopicId +
                                ". Expected format: M1T1S1"
                        );
                    }

                    if (!subtopicId.startsWith(topicId)) {
                        throw new IllegalArgumentException(
                                "Subtopic ID " + subtopicId + " does not belong to topic " + topicId);
                    }

                    if (sub.getTitle() == null || sub.getTitle().isBlank()) {
                        throw new IllegalArgumentException("Subtopic title cannot be empty.");
                    }

                    if (!subtopicIds.add(subtopicId)) {
                        throw new IllegalArgumentException(
                                "Duplicate subtopic ID detected: " + subtopicId
                        );
                    }
                }
            }
        }

    } catch (JsonProcessingException e) {
        throw new IllegalArgumentException("Invalid JSON structure.");
    }
    }
    
    private void validateMetadata(
            Integer duration,
            Integer salaryMin,
            Integer salaryMax) {

        // Duration validation
        if (duration != null && duration <= 0) {
            throw new IllegalArgumentException(
                    "Estimated duration must be greater than 0."
            );
        }

        // Salary cannot be negative
        if (salaryMin != null && salaryMin < 0) {
            throw new IllegalArgumentException(
                    "Salary minimum cannot be negative."
            );
        }

        if (salaryMax != null && salaryMax < 0) {
            throw new IllegalArgumentException(
                    "Salary maximum cannot be negative."
            );
        }

        // Salary range consistency
        if (salaryMin != null && salaryMax != null) {
            if (salaryMin > salaryMax) {
                throw new IllegalArgumentException(
                        "Salary minimum cannot be greater than salary maximum."
                );
            }
        }
    }
    
    @CacheEvict(value = {"roadmaps", "roadmapStructure"}, key = "#id")
    @Transactional
    public RoadmapResponse patchRoadmap(Long id, UpdateRoadmapRequest request) {

        Roadmap entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found with id: " + id));

        // Update only non-null fields

        if (request.getTitle() != null) {
            entity.setTitle(request.getTitle().trim());
        }

        if (request.getLevel() != null) {
            entity.setRoadmapLevel(request.getLevel().trim());
        }

        if (request.getStructureJson() != null) {
            validateStructure(request.getStructureJson());
            entity.setStructureJson(request.getStructureJson());
        }
        
        if (request.getEstimatedDurationMonths() != null) {
            entity.setEstimatedDurationMonths(request.getEstimatedDurationMonths());
        }

        if (request.getSalaryMin() != null) {
            entity.setSalaryMin(request.getSalaryMin());
        }

        if (request.getSalaryMax() != null) {
            entity.setSalaryMax(request.getSalaryMax());
        }

        if (request.getRequiredSkills() != null) {
            entity.setRequiredSkills(request.getRequiredSkills());
        }

        if (request.getHighlightTags() != null) {
            entity.setHighlightTags(request.getHighlightTags());
        }
        
        validateMetadata(
                request.getEstimatedDurationMonths() != null
                        ? request.getEstimatedDurationMonths()
                        : entity.getEstimatedDurationMonths(),

                request.getSalaryMin() != null
                        ? request.getSalaryMin()
                        : entity.getSalaryMin(),

                request.getSalaryMax() != null
                        ? request.getSalaryMax()
                        : entity.getSalaryMax()
        );

        Roadmap updated = repository.save(entity);

        return convertToResponse(updated);
    }
    
    @CacheEvict(value = {"roadmaps", "roadmapStructure"}, key = "#id")
    @Transactional
    public void restoreRoadmap(Long id) {

        Roadmap entity = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Roadmap not found with id: " + id));

        // Idempotent behavior
        if (!entity.isDeleted()) {
            return;
        }

        entity.setDeleted(false);
        entity.setDeletedAt(null);

        repository.save(entity);
    }
    
    public Page<RoadmapResponse> getAllIncludingDeleted(Pageable pageable) {
        return repository.findAll(pageable)
                .map(this::convertToResponse);
    }
    
    @CacheEvict(value = {"roadmaps", "roadmapStructure"}, allEntries = true)
    @Transactional
    public void shuffleActiveRoadmaps() {

        // Fetch only active roadmaps directly from DB
        List<Roadmap> active = new ArrayList<>(
                repository.findAll().stream()
                        .filter(r -> !r.isDeleted())
                        .toList()
        );

        if (active.isEmpty()) {
            return;
        }

        // Shuffle in memory
        Collections.shuffle(active);

        // Resequence displayOrder
        int order = 1;
        for (Roadmap roadmap : active) {
            roadmap.setDisplayOrder(order++);
        }

        repository.saveAll(active);
    }
    
    @Transactional
    public NodeDetailResponse getNodeDetail(Long roadmapId, String nodeId) {

        Roadmap roadmap = repository.findByIdAndDeletedFalse(roadmapId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Roadmap not found"));

        try {
            JsonNode root = objectMapper.readTree(roadmap.getStructureJson());

            JsonNode modulesNode = root.isArray() ? root : root.path("modules");

            for (JsonNode module : modulesNode) {

                // MODULE MATCH
                if (module.path("id").asText().equals(nodeId)) {
                    return NodeDetailResponse.builder()
                            .roadmapId(roadmapId)
                            .nodeId(nodeId)
                            .type("MODULE")
                            .title(module.path("title").asText())
                            .description(module.path("description").asText())
                            .build();
                }

                for (JsonNode topic : module.path("topics")) {

                    // TOPIC MATCH
                    if (topic.path("id").asText().equals(nodeId)) {

                        TopicResourcesDTO resources = null;

                        if (isRoadmapStarted(roadmap)) {
                            resources = objectMapper.treeToValue(
                                    topic.path("resources"),
                                    TopicResourcesDTO.class
                            );
                        }

                        return NodeDetailResponse.builder()
                                .roadmapId(roadmapId)
                                .nodeId(nodeId)
                                .type("TOPIC")
                                .title(topic.path("title").asText())
                                .description(topic.path("description").asText())
                                .resources(resources)
                                .build();
                    }

                    for (JsonNode sub : topic.path("subtopics")) {

                        // SUBTOPIC MATCH
                        if (sub.path("id").asText().equals(nodeId)) {

                            boolean locked = true;
                            boolean completed = false;

                            if (isAuthenticated() && isRoadmapStarted(roadmap)) {

                                User user = getCurrentUser();

                                List<UserProgress> progressList =
                                        userProgressRepository.findByUserAndRoadmap(user, roadmap);

                                Set<String> completedIds = progressList.stream()
                                        .map(UserProgress::getSubtopicId)
                                        .collect(Collectors.toSet());

                                completed = completedIds.contains(nodeId);

                                List<String> orderedIds =
                                        getOrderedSubtopicIdsInternal(roadmap);

                                int index = orderedIds.indexOf(nodeId);

                                if (index == 0) {
                                    locked = false;
                                } else {
                                    locked = false;
                                    for (int i = 0; i < index; i++) {
                                        if (!completedIds.contains(orderedIds.get(i))) {
                                            locked = true;
                                            break;
                                        }
                                    }
                                }
                            }

                            return NodeDetailResponse.builder()
                                    .roadmapId(roadmapId)
                                    .nodeId(nodeId)
                                    .type("SUBTOPIC")
                                    .title(sub.path("title").asText())
                                    .description(sub.path("description").asText())
                                    .locked(locked)
                                    .completed(completed)
                                    .build();
                        }
                    }
                }
            }

            throw new ResourceNotFoundException("Node not found");

        } catch (Exception e) {
            throw new IllegalStateException("Invalid roadmap structure");
        }
    }
    
    private boolean isAuthenticated() {
        return SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()
                && !"anonymousUser".equals(
                    SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                );
    }

    private User getCurrentUser() {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalStateException("User not found"));
    }

    private boolean isRoadmapStarted(Roadmap roadmap) {

        if (!isAuthenticated()) {
            return false;
        }

        User user = getCurrentUser();

        return userRoadmapRepository
                .existsByUserAndRoadmap(user, roadmap);
    }

    private List<String> getOrderedSubtopicIdsInternal(Roadmap roadmap) {

        try {
            JsonNode root = objectMapper.readTree(roadmap.getStructureJson());
            List<String> ordered = new ArrayList<>();

            JsonNode modulesNode = root.isArray() ? root : root.path("modules");

            for (JsonNode module : modulesNode) {
                for (JsonNode topic : module.path("topics")) {
                    for (JsonNode sub : topic.path("subtopics")) {
                        ordered.add(sub.path("id").asText());
                    }
                }
            }

            return ordered;

        } catch (Exception e) {
            throw new IllegalStateException("Invalid roadmap structure");
        }
    }
    
    @Transactional
    public CompareResponseDTO compareRoadmaps(Long id1, Long id2) {

        if (id1.equals(id2)) {
            throw new IllegalArgumentException("Cannot compare same roadmap.");
        }

        Roadmap first = repository.findByIdAndDeletedFalse(id1)
                .orElseThrow(() -> new ResourceNotFoundException("First roadmap not found"));

        Roadmap second = repository.findByIdAndDeletedFalse(id2)
                .orElseThrow(() -> new ResourceNotFoundException("Second roadmap not found"));

        CompareRoadmapDTO firstDTO = buildCompareDTO(first);
        CompareRoadmapDTO secondDTO = buildCompareDTO(second);

        return CompareResponseDTO.builder()
                .first(firstDTO)
                .second(secondDTO)
                .build();
    }
    
    private CompareRoadmapDTO buildCompareDTO(Roadmap roadmap) {

        try {
            JsonNode root = objectMapper.readTree(roadmap.getStructureJson());

            JsonNode modulesNode = root.isArray() ? root : root.path("modules");

            int moduleCount = 0;
            int topicCount = 0;

            for (JsonNode module : modulesNode) {
                moduleCount++;

                JsonNode topics = module.path("topics");
                if (topics.isArray()) {
                    topicCount += topics.size();
                }
            }

            return CompareRoadmapDTO.builder()
                    .id(roadmap.getId())
                    .title(roadmap.getTitle())
                    .level(roadmap.getRoadmapLevel())
                    .totalModules(moduleCount)
                    .totalTopics(topicCount)
                    .estimatedDurationMonths(roadmap.getEstimatedDurationMonths())
                    .salaryMin(roadmap.getSalaryMin())
                    .salaryMax(roadmap.getSalaryMax())
                    .requiredSkills(roadmap.getRequiredSkills())
                    .highlightTags(roadmap.getHighlightTags())
                    .build();

        } catch (Exception e) {
            throw new IllegalStateException("Invalid roadmap structure");
        }
    }

}

