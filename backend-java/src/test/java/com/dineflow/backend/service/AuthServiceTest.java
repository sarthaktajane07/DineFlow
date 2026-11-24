package com.dineflow.backend.service;

import com.dineflow.backend.dto.LoginRequest;
import com.dineflow.backend.dto.RegisterRequest;
import com.dineflow.backend.exception.BadRequestException;
import com.dineflow.backend.model.User;
import com.dineflow.backend.repository.UserRepository;
import com.dineflow.backend.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private ActivityService activityService;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId("u123");
        user.setFullName("John Doe");
        user.setEmail("john@example.com");
        user.setPassword("encoded_pwd");
        user.setRole("staff");
        user.setActive(true);
    }

    @Test
    void testRegister_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("John Doe");
        req.setEmail("john@example.com");
        req.setPassword("secret123");
        req.setRole("staff");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded_pwd");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtUtils.generateToken("u123", "staff")).thenReturn("mock.jwt.token");

        Map<String, Object> res = authService.register(req, null);

        assertNotNull(res);
        assertEquals("mock.jwt.token", res.get("token"));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegister_EmailAlreadyExists() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("john@example.com");
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req, null));
    }

    @Test
    void testLogin_Success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("john@example.com");
        req.setPassword("secret123");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "encoded_pwd")).thenReturn(true);
        when(jwtUtils.generateToken("u123", "staff")).thenReturn("mock.jwt.token");

        Map<String, Object> res = authService.login(req);

        assertNotNull(res);
        assertEquals("mock.jwt.token", res.get("token"));
    }

    @Test
    void testLogin_InvalidPassword() {
        LoginRequest req = new LoginRequest();
        req.setEmail("john@example.com");
        req.setPassword("wrong");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded_pwd")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.login(req));
    }
}
