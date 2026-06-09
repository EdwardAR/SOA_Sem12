package com.northwind.auth.service;

import com.northwind.auth.dto.AuthDtos.LoginRequest;
import com.northwind.auth.dto.AuthDtos.LoginResponse;
import com.northwind.auth.entity.UserEntity;
import com.northwind.auth.repository.UserRepository;
import com.northwind.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public LoginResponse login(LoginRequest request) {
    UserEntity user = userRepository.findByUsername(request.username())
      .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    if (!passwordEncoder.matches(request.password(), user.getPassword())) {
      throw new IllegalArgumentException("Credenciales invalidas");
    }
    return new LoginResponse(jwtService.generateToken(user), user.getRole(), user.getUsername());
  }
}
