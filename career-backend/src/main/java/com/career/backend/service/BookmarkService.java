package com.career.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.career.backend.dto.RoadmapResponse;
import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.entity.UserBookmark;
import com.career.backend.repository.RoadmapRepository;
import com.career.backend.repository.UserBookmarkRepository;
import com.career.backend.repository.UserRepository;

@Service
public class BookmarkService {

    private final UserBookmarkRepository bookmarkRepository;
    private final RoadmapRepository roadmapRepository;
    private final UserRepository userRepository;

    public BookmarkService(UserBookmarkRepository bookmarkRepository,
                           RoadmapRepository roadmapRepository,
                           UserRepository userRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.roadmapRepository = roadmapRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    public void bookmarkRoadmap(Long roadmapId) {

        User user = getCurrentUser();

        Roadmap roadmap = roadmapRepository.findByIdAndDeletedFalse(roadmapId)
                .orElseThrow(() -> new IllegalArgumentException("Roadmap not found"));

        if (bookmarkRepository.existsByUserAndRoadmap(user, roadmap)) {
            return;
        }

        UserBookmark bookmark = new UserBookmark();
        bookmark.setUser(user);
        bookmark.setRoadmap(roadmap);

        bookmarkRepository.save(bookmark);
    }

    public void removeBookmark(Long roadmapId) {

        User user = getCurrentUser();

        Roadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new IllegalArgumentException("Roadmap not found"));

        bookmarkRepository.findByUserAndRoadmap(user, roadmap)
                .ifPresent(bookmarkRepository::delete);
    }

    public List<RoadmapResponse> getBookmarks() {

        User user = getCurrentUser();

        return bookmarkRepository.findByUser(user)
                .stream()
                .map(b -> {
                    Roadmap r = b.getRoadmap();
                    RoadmapResponse res = new RoadmapResponse();
                    res.setId(r.getId());
                    res.setTitle(r.getTitle());
                    res.setLevel(r.getRoadmapLevel());
                    res.setEstimatedDurationMonths(r.getEstimatedDurationMonths());
                    res.setSalaryMin(r.getSalaryMin());
                    res.setSalaryMax(r.getSalaryMax());
                    res.setHighlightTags(r.getHighlightTags());
                    return res;
                })
                .collect(Collectors.toList());
    }

    public boolean isBookmarked(Long roadmapId) {

        User user = getCurrentUser();

        Roadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow();

        return bookmarkRepository.existsByUserAndRoadmap(user, roadmap);
    }
}