package com.dineflow.backend.controller;

import com.dineflow.backend.dto.ApiResponse;
import com.dineflow.backend.dto.DeleteWaitlistRequest;
import com.dineflow.backend.dto.NotifyRequest;
import com.dineflow.backend.dto.SeatRequest;
import com.dineflow.backend.dto.WaitlistRequest;
import com.dineflow.backend.dto.WaitlistUpdateRequest;
import com.dineflow.backend.service.WaitlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistService waitlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWaitlist(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        List<Map<String, Object>> list = waitlistService.getWaitlist(status, priority);
        return ResponseEntity.ok(ApiResponse.success(list.size(), Map.of("waitlist", list)));
    }

    @GetMapping("/stats/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWaitlistStats() {
        Map<String, Object> stats = waitlistService.getStats();
        return ResponseEntity.ok(ApiResponse.success(Map.of("stats", stats)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWaitlistEntry(@PathVariable String id) {
        Map<String, Object> entry = waitlistService.getWaitlistEntry(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("entry", entry)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addToWaitlist(
            @Valid @RequestBody WaitlistRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> result = waitlistService.addToWaitlist(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Added to waitlist successfully", result));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateWaitlistEntry(
            @PathVariable String id,
            @RequestBody WaitlistUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> entry = waitlistService.updateWaitlistEntry(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Waitlist entry updated", Map.of("entry", entry)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> removeFromWaitlist(
            @PathVariable String id,
            @RequestBody(required = false) DeleteWaitlistRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        waitlistService.removeFromWaitlist(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Removed from waitlist", null));
    }

    @PostMapping("/{id}/notify")
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> notifyGuest(
            @PathVariable String id,
            @RequestBody(required = false) NotifyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> result = waitlistService.notifyGuest(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Guest notified successfully", result));
    }

    @PostMapping("/{id}/seat")
    @PreAuthorize("hasAnyRole('HOST', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> seatGuest(
            @PathVariable String id,
            @Valid @RequestBody SeatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> result = waitlistService.seatGuest(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Guest seated successfully", result));
    }
}
