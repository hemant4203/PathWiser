package com.career.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.career.backend.entity.User;
import com.career.backend.model.Role;



public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    
    Page<User> findByRole(Role role, Pageable pageable);

    Page<User> findByRoleAndUsernameContainingIgnoreCase(
            Role role,
            String username,
            Pageable pageable
    );
}
