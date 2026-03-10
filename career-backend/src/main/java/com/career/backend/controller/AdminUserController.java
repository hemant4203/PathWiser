package com.career.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.career.backend.dto.UserManagementDto;
import com.career.backend.service.AdminUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService service;

    @GetMapping
    public Page<UserManagementDto> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return service.getUsers(page, size, search);
    }

    @PatchMapping("/{id}/suspend")
    public void suspendUser(@PathVariable Long id) {
        service.suspendUser(id);
    }

    @PatchMapping("/{id}/activate")
    public void activateUser(@PathVariable Long id) {
        service.activateUser(id);
    }
}
