package com.career.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.career.backend.dto.UserManagementDto;
import com.career.backend.entity.User;
import com.career.backend.model.Role;
import com.career.backend.repository.RefreshTokenRepository;
import com.career.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public Page<UserManagementDto> getUsers(int page, int size, String search) {

        Pageable pageable = PageRequest.of(page, size);

        Page<User> users;

        if (search == null || search.isBlank()) {
            users = userRepository.findByRole(Role.USER, pageable);
        } else {
            users = userRepository
                    .findByRoleAndUsernameContainingIgnoreCase(
                            Role.USER,
                            search,
                            pageable
                    );
        }

        return users.map(user -> new UserManagementDto(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.isEnabled(),
                user.getCreatedAt()
        ));
    }

    @Override
    public void suspendUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(false);

        userRepository.save(user);

        // revoke refresh tokens
        refreshTokenRepository.deleteAll(
                refreshTokenRepository.findAll()
                        .stream()
                        .filter(t -> t.getUser().getId().equals(id))
                        .toList()
        );
    }

    @Override
    public void activateUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(true);

        userRepository.save(user);
    }
}