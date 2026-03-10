package com.career.backend.security;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.career.backend.config.RateLimitProperties;
import com.career.backend.errors.RateLimitExceededException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;

    private final RateLimitProperties rateLimitProperties;

    public RateLimitingFilter(RateLimiterService rateLimiterService,
                              RateLimitProperties rateLimitProperties) {
        this.rateLimiterService = rateLimiterService;
        this.rateLimitProperties = rateLimitProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        String ip = request.getRemoteAddr();

        try {

            if (path.startsWith("/api/auth/login")) {

                String key = "LOGIN:" + ip;
                rateLimiterService.validateRequest(
                        key,
                        rateLimitProperties.getLogin().getMaxRequests(),
                        rateLimitProperties.getLogin().getWindowSeconds()
                );
            }

            if (path.startsWith("/api/auth/refresh")) {

                String key = "REFRESH:" + ip;
                rateLimiterService.validateRequest(
                        key,
                        rateLimitProperties.getRefresh().getMaxRequests(),
                        rateLimitProperties.getRefresh().getWindowSeconds()
                );
            }

            filterChain.doFilter(request, response);

        } catch (RateLimitExceededException ex) {

            response.setStatus(429);
            response.setContentType("application/json");

            response.getWriter().write("""
                {
                  "status": 429,
                  "error": "Too Many Requests",
                  "message": "Too many requests. Please try again later."
                }
            """);

            response.getWriter().flush();
        }
    }
}