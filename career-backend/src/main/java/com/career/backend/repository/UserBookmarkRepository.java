package com.career.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.career.backend.entity.Roadmap;
import com.career.backend.entity.User;
import com.career.backend.entity.UserBookmark;

public interface UserBookmarkRepository extends JpaRepository<UserBookmark, Long> {

    boolean existsByUserAndRoadmap(User user, Roadmap roadmap);

    Optional<UserBookmark> findByUserAndRoadmap(User user, Roadmap roadmap);

    List<UserBookmark> findByUser(User user);

}