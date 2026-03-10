package com.career.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.career.backend.dto.CompareResponseDTO;
import com.career.backend.dto.NodeDetailResponse;
import com.career.backend.dto.RoadmapDetailResponse;
import com.career.backend.dto.RoadmapRequest;
import com.career.backend.dto.RoadmapResponse;
import com.career.backend.dto.UpdateRoadmapRequest;
import com.career.backend.service.RoadmapService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/roadmaps")
public class RoadmapController {

    private final RoadmapService service;

    public RoadmapController(RoadmapService service) {
        this.service = service;
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public ResponseEntity<Page<RoadmapResponse>> getAllRoadmaps(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<RoadmapResponse> response =
                service.getAllRoadmaps(pageable, sortBy, direction);

        return ResponseEntity.ok(response);
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<RoadmapDetailResponse> getRoadmapById(@PathVariable Long id) {

        return ResponseEntity.ok(service.getRoadmapById(id));
    }


    // =========================
    // CREATE (POST)
    // =========================
    @PostMapping
    public ResponseEntity<RoadmapResponse> createRoadmap(
    		@Valid @RequestBody RoadmapRequest request) {
    	
    	RoadmapResponse response = service.createRoadmap(request);
    	
    	return ResponseEntity
    			.status(HttpStatus.CREATED)
    			.body(response);
    }

    // =========================
    // UPDATE (PUT) – SIMPLE TEST VERSION
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<RoadmapResponse> updateRoadmap(
            @PathVariable Long id,
            @Valid @RequestBody RoadmapRequest request) {

        RoadmapResponse response = service.updateRoadmap(id, request);

        return ResponseEntity.ok(response);
    }



    // =========================
    // DELETE
    // =========================
  
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoadmap(@PathVariable Long id) {

        service.deleteRoadmap(id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RoadmapResponse> patchRoadmap(
            @PathVariable Long id,
            @RequestBody UpdateRoadmapRequest request) {

        RoadmapResponse response = service.patchRoadmap(id, request);

        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/restore")
    public ResponseEntity<Void> restoreRoadmap(@PathVariable Long id) {

        service.restoreRoadmap(id);

        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<Page<RoadmapResponse>> getAllIncludingDeleted(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<RoadmapResponse> response = service.getAllIncludingDeleted(pageable);

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/admin/shuffle")
    public ResponseEntity<Void> shuffleRoadmaps() {
        service.shuffleActiveRoadmaps();
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{roadmapId}/node/{nodeId}")
    public ResponseEntity<NodeDetailResponse> getNodeDetail(
            @PathVariable Long roadmapId,
            @PathVariable String nodeId) {

        return ResponseEntity.ok(
                service.getNodeDetail(roadmapId, nodeId)
        );
    }
    
    @GetMapping("/compare")
    public ResponseEntity<CompareResponseDTO> compareRoadmaps(
            @RequestParam Long id1,
            @RequestParam Long id2) {

        return ResponseEntity.ok(
                service.compareRoadmaps(id1, id2)
        );
    }

}
