package com.example.Backend.controller;

import com.example.Backend.dto.*;
import com.example.Backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    /** POST /api/auth/signup  — Register a new user */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(service.register(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** POST /api/auth/login  — Authenticate and get JWT */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticate(
            @RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(service.authenticate(request)));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid credentials"));
        }
    }

    /** GET /api/auth/me  — Get current user profile (requires JWT) */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMe(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(service.getMe(auth.getName())));
    }

    /** PUT /api/auth/me  — Update current user profile */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateMe(
            Authentication auth,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                service.updateProfile(auth.getName(), request)));
    }
}
