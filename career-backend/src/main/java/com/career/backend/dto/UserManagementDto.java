package com.career.backend.dto;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserManagementDto {

    private Long id;

    private String username;

    private String role;

    private boolean enabled;

    private LocalDateTime createdAt;
}