package com.career.backend.service;

import org.springframework.data.domain.Page;

import com.career.backend.dto.UserManagementDto;

public interface AdminUserService {

    Page<UserManagementDto> getUsers(int page, int size, String search);

    void suspendUser(Long id);

    void activateUser(Long id);
}