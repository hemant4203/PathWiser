package com.career.backend.config;

import java.security.Key;
import java.util.Date;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

	private final JwtProperties jwtProperties;

	public JwtUtil(JwtProperties jwtProperties) {
	    this.jwtProperties = jwtProperties;
	}

	private Key getSigningKey() {
	    return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());
	}

    // 🔐 ACCESS TOKEN
    public String generateAccessToken(String username, String role) {

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("type", "ACCESS")
                .setIssuedAt(new Date())
                .setExpiration(new Date(
                        System.currentTimeMillis() + jwtProperties.getAccessExpirationMs()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 🔄 REFRESH TOKEN
    public String generateRefreshToken(String username) {

        return Jwts.builder()
                .setSubject(username)
                .claim("type", "REFRESH")
                .setIssuedAt(new Date())
                .setExpiration(new Date(
                        System.currentTimeMillis() + jwtProperties.getRefreshExpirationMs()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public String extractTokenType(String token) {
        return getClaims(token).get("type", String.class);
    }

    public Date extractExpiration(String token) {
        return getClaims(token).getExpiration();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
    
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}