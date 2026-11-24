package com.dineflow.backend.controller;

import com.dineflow.backend.dto.ApiResponse;
import com.dineflow.backend.dto.LoginRequest;
import com.dineflow.backend.dto.RegisterRequest;
import com.dineflow.backend.dto.UpdatePasswordRequest;
import com.dineflow.backend.dto.UpdateProfileRequest;
import com.dineflow.backend.model.User;
import com.dineflow.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(
            @Valid @RequestBody RegisterRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String createdById = userDetails != null ? userDetails.getUsername() : null;
        Map<String, Object> data = authService.register(request, createdById);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @Valid @RequestBody LoginRequest request) {
        Map<String, Object> data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", data));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getMe(userDetails.getUsername());
        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("id", user.getId());
        userData.put("fullName", user.getFullName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());
        userData.put("isActive", user.isActive());
        userData.put("lastLogin", user.getLastLogin());
        userData.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(ApiResponse.success(Map.of("user", userData)));
    }

    @PutMapping("/update-profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", Map.of("user", user)));
    }

    @PutMapping("/update-password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            @Valid @RequestBody UpdatePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        authService.updatePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully", null));
    }
}
