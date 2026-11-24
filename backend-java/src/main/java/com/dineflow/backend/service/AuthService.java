package com.dineflow.backend.service;

import com.dineflow.backend.dto.AuthResponse;
import com.dineflow.backend.dto.LoginRequest;
import com.dineflow.backend.dto.RegisterRequest;
import com.dineflow.backend.dto.UpdatePasswordRequest;
import com.dineflow.backend.dto.UpdateProfileRequest;
import com.dineflow.backend.exception.BadRequestException;
import com.dineflow.backend.model.User;
import com.dineflow.backend.repository.UserRepository;
import com.dineflow.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final ActivityService activityService;

    public Map<String, Object> register(RegisterRequest request, String createdById) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new BadRequestException("User with this email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : "staff");
        user.setActive(true);
        if (createdById != null) user.setCreatedBy(createdById);

        user = userRepository.save(user);

        String token = jwtUtils.generateToken(user.getId(), user.getRole());

        activityService.logAsync("auth", "register",
                "User registered: " + user.getEmail(), null, null);

        return buildAuthResponse(token, user);
    }

    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!user.isActive()) {
            throw new BadRequestException("Your account has been deactivated. Please contact an administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid credentials");
        }

        user.setLastLogin(Instant.now());
        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getId(), user.getRole());

        activityService.logAsync("auth", "login",
                "User logged in: " + user.getEmail(), user.getId(), null);

        return buildAuthResponse(token, user);
    }

    public User getMe(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    public User updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) {
            String email = request.getEmail().toLowerCase();
            if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(email);
        }

        return userRepository.save(user);
    }

    public void updatePassword(String userId, UpdatePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private Map<String, Object> buildAuthResponse(String token, User user) {
        return Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "fullName", user.getFullName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        );
    }
}
