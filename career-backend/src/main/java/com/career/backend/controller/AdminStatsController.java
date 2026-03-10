package com.career.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.career.backend.dto.AdminStatsDto;
import com.career.backend.service.AdminStatsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService service;

    @GetMapping
    public AdminStatsDto getDashboardStats() {
        return service.getDashboardStats();
    }
}