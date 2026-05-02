package com.example.Backend.service;

import com.example.Backend.config.JwtService;
import com.example.Backend.dto.*;
import com.example.Backend.model.Role;
import com.example.Backend.model.User;
import com.example.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository   repository;
    private final PasswordEncoder  passwordEncoder;
    private final JwtService       jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        var user = User.builder()
                .email(request.getEmail())
                .srCode(request.getSrCode())
                .name(request.getName() != null ? request.getName() : request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .user(toDto(user))
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        var user = repository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .user(toDto(user))
                .build();
    }

    public UserDto getMe(String email) {
        return toDto(repository.findByEmail(email).orElseThrow());
    }

    public UserDto updateProfile(String email, UpdateProfileRequest req) {
        User user = repository.findByEmail(email).orElseThrow();
        if (req.getName()    != null) user.setName(req.getName());
        if (req.getNumber()  != null) user.setNumber(req.getNumber());
        if (req.getCourse()  != null) user.setCourse(req.getCourse());
        if (req.getSection() != null) user.setSection(req.getSection());
        if (req.getPhoto()   != null) user.setPhoto(req.getPhoto());
        repository.save(user);
        return toDto(user);
    }

    public static UserDto toDto(User u) {
        if (u == null) return null;
        return UserDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .srCode(u.getSrCode())
                .name(u.getName())
                .number(u.getNumber())
                .course(u.getCourse())
                .section(u.getSection())
                .photo(u.getPhoto())
                .role(u.getRole() != null ? u.getRole().name() : null)
                .build();
    }
}
