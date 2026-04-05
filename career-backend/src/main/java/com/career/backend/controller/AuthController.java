package com.career.backend.controller;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.career.backend.config.JwtUtil;
import com.career.backend.dto.LoginRequest;
import com.career.backend.dto.RefreshTokenRequest;
import com.career.backend.dto.RegisterRequest;
import com.career.backend.entity.RefreshToken;
import com.career.backend.entity.User;
import com.career.backend.model.Role;
import com.career.backend.repository.RefreshTokenRepository;
import com.career.backend.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) throws SQLException {
        // 1️⃣ Authenticate credentials
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getUsername(),
                                request.getPassword()
                        )
                );

        // 2️⃣ Fetch user entity
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3️⃣ Generate tokens
        String accessToken = jwtUtil.generateAccessToken(
                user.getUsername(),
                user.getRole().name()
        );

        String refreshTokenString = jwtUtil.generateRefreshToken(
                user.getUsername()
        );

        // 4️⃣ Persist refresh token
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenString);
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(LocalDateTime.now().plusDays(7));
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);

        // 5️⃣ Return both tokens
        return ResponseEntity.ok(Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshTokenString,
				"userName" , user.getUsername()
        ));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {

        String requestToken = request.getRefreshToken();

        // 1️⃣ Validate JWT structure & signature
        String username;
        try {
            username = jwtUtil.extractUsername(requestToken);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid refresh token.");
        }

        // 2️⃣ Validate token type
        String tokenType = jwtUtil.extractTokenType(requestToken);
        if (!"REFRESH".equals(tokenType)) {
            throw new IllegalArgumentException("Invalid token type.");
        }

        // 3️⃣ Fetch from DB
        RefreshToken storedToken = refreshTokenRepository.findByToken(requestToken)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found."));

        // 4️⃣ Check revoked
        if (storedToken.isRevoked()) {
            throw new IllegalArgumentException("Refresh token revoked.");
        }

        // 5️⃣ Check expiry (DB-level)
        if (storedToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Refresh token expired.");
        }

        // 6️⃣ Check JWT expiration
        if (jwtUtil.isTokenExpired(requestToken)) {
            throw new IllegalArgumentException("Refresh token expired.");
        }

        User user = storedToken.getUser();

        // 7️⃣ Revoke old token (rotation)
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // 8️⃣ Generate new tokens
        String newAccessToken = jwtUtil.generateAccessToken(
                user.getUsername(),
                user.getRole().name()
        );

        String newRefreshTokenString = jwtUtil.generateRefreshToken(
                user.getUsername()
        );

        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setToken(newRefreshTokenString);
        newRefreshToken.setUser(user);
        newRefreshToken.setExpiryDate(LocalDateTime.now().plusDays(7));
        newRefreshToken.setRevoked(false);

        refreshTokenRepository.save(newRefreshToken);

        // 9️⃣ Return new tokens
        return ResponseEntity.ok(Map.of(
                "accessToken", newAccessToken,
                "refreshToken", newRefreshTokenString,
				"userName", user.getUsername()
        ));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody RefreshTokenRequest request) {

        String token = request.getRefreshToken();

        RefreshToken storedToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found."));

        if (storedToken.isRevoked()) {
            throw new IllegalArgumentException("Token already revoked.");
        }

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists.");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        userRepository.save(user);

        return ResponseEntity.status(201)
                .body(Map.of("message", "User registered successfully."));
    }
}
