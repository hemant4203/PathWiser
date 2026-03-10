package com.career.backend.service;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.career.backend.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    // Runs daily at 2 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredAndOldRevokedTokens() {

        LocalDateTime now = LocalDateTime.now();

        // 24-hour audit window for revoked tokens
        LocalDateTime revokedThreshold = now.minusDays(1);

        refreshTokenRepository
                .deleteByExpiryDateBeforeOrRevokedIsTrueAndCreatedAtBefore(
                        now,
                        revokedThreshold
                );

        System.out.println("Token cleanup executed at: " + now);
    }
}