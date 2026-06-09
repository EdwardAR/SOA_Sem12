package com.northwind.auth.dto;

public final class AuthDtos {
  private AuthDtos() {}

  public record LoginRequest(String username, String password) {}
  public record LoginResponse(String token, String role, String username) {}
}

