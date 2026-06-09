package com.northwind.auth.security;

import com.northwind.auth.entity.UserEntity;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey key;
  private final long expirationMinutes;

  public JwtService(
      @Value("${jwt.secret:northwind-northwind-northwind-northwind-secret-key}") String secret,
      @Value("${jwt.expiration-minutes:60}") long expirationMinutes) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMinutes = expirationMinutes;
  }

  public String generateToken(UserEntity user) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(user.getUsername())
        .claim("role", user.getRole())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }
}
