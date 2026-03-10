package com.career.backend.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.career.backend.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByExpiryDateBefore(LocalDateTime now);
    
    void deleteByExpiryDateBeforeOrRevokedIsTrueAndCreatedAtBefore(
            LocalDateTime now,
            LocalDateTime revokedThreshold
    );
}
