package com.career.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.career.backend.security.RateLimitingFilter;
import com.career.backend.service.CustomUserDetailsService;

import jakarta.servlet.http.HttpServletResponse;

@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          RateLimitingFilter rateLimitingFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitingFilter = rateLimitingFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()

                // Admin endpoints (NEW FIX)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Admin Roadmap management
                .requestMatchers(HttpMethod.GET,
                        "/api/roadmaps/admin/**")
                .hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST,
                        "/api/roadmaps/admin/shuffle")
                .hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST,
                        "/api/roadmaps")
                .hasRole("ADMIN")

                .requestMatchers(HttpMethod.PUT,
                        "/api/roadmaps/**")
                .hasRole("ADMIN")

                .requestMatchers(HttpMethod.PATCH,
                        "/api/roadmaps/**")
                .hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE,
                        "/api/roadmaps/**")
                .hasRole("ADMIN")

                // Public roadmap viewing
                .requestMatchers(HttpMethod.GET,
                        "/api/roadmaps",
                        "/api/roadmaps/**")
                .permitAll()

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            .addFilterBefore(rateLimitingFilter,
                    UsernamePasswordAuthenticationFilter.class)

            .addFilterBefore(jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class)

            .exceptionHandling(ex -> ex
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("""
                        {
                          "status": 403,
                          "error": "Forbidden",
                          "message": "You do not have permission to access this resource"
                        }
                    """);
                })
            );

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:5173");

        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}