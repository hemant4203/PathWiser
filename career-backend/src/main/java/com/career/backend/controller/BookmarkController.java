package com.career.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.career.backend.dto.RoadmapResponse;
import com.career.backend.service.BookmarkService;

@RestController
@RequestMapping("/api/user/bookmarks")
public class BookmarkController {

    private final BookmarkService service;

    public BookmarkController(BookmarkService service) {
        this.service = service;
    }

    @PostMapping("/{roadmapId}")
    public ResponseEntity<Void> bookmarkRoadmap(@PathVariable Long roadmapId) {

        service.bookmarkRoadmap(roadmapId);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roadmapId}")
    public ResponseEntity<Void> removeBookmark(@PathVariable Long roadmapId) {

        service.removeBookmark(roadmapId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<RoadmapResponse>> getBookmarks() {

        return ResponseEntity.ok(service.getBookmarks());
    }

    @GetMapping("/check/{roadmapId}")
    public ResponseEntity<Boolean> checkBookmark(@PathVariable Long roadmapId) {

        return ResponseEntity.ok(service.isBookmarked(roadmapId));
    }
}