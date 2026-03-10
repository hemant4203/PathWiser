package com.career.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.career.backend.dto.RoadmapRequest;
import com.career.backend.dto.RoadmapResponse;
import com.career.backend.dto.UpdateRoadmapRequest;
import com.career.backend.service.RoadmapService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/roadmaps")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRoadmapController {

    private final RoadmapService service;

    public AdminRoadmapController(RoadmapService service) {
        this.service = service;
    }

    // CREATE ROADMAP
    @PostMapping
    public ResponseEntity<RoadmapResponse> createRoadmap(
            @Valid @RequestBody RoadmapRequest request) {

        RoadmapResponse response = service.createRoadmap(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // UPDATE ROADMAP
    @PutMapping("/{id}")
    public ResponseEntity<RoadmapResponse> updateRoadmap(
            @PathVariable Long id,
            @Valid @RequestBody RoadmapRequest request) {

        RoadmapResponse response = service.updateRoadmap(id, request);

        return ResponseEntity.ok(response);
    }

    // PARTIAL UPDATE
    @PatchMapping("/{id}")
    public ResponseEntity<RoadmapResponse> patchRoadmap(
            @PathVariable Long id,
            @RequestBody UpdateRoadmapRequest request) {

        RoadmapResponse response = service.patchRoadmap(id, request);

        return ResponseEntity.ok(response);
    }

    // DELETE ROADMAP
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoadmap(@PathVariable Long id) {

        service.deleteRoadmap(id);

        return ResponseEntity.noContent().build();
    }

    // RESTORE ROADMAP
    @PutMapping("/{id}/restore")
    public ResponseEntity<Void> restoreRoadmap(@PathVariable Long id) {

        service.restoreRoadmap(id);

        return ResponseEntity.noContent().build();
    }

    // ADMIN LIST (INCLUDING DELETED)
    @GetMapping("/all")
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

    // SHUFFLE DISPLAY ORDER
    @PostMapping("/shuffle")
    public ResponseEntity<Void> shuffleRoadmaps() {
        service.shuffleActiveRoadmaps();
        return ResponseEntity.noContent().build();
    }
}