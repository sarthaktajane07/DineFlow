package com.dineflow.backend.controller;

import com.dineflow.backend.dto.ApiResponse;
import com.dineflow.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        Map<String, Object> data = analyticsService.getOverview();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/occupancy")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOccupancy() {
        Map<String, Object> data = analyticsService.getOccupancy();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/wait-time")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWaitTime() {
        Map<String, Object> data = analyticsService.getWaitTime();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/service-duration")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getServiceDuration() {
        Map<String, Object> data = analyticsService.getServiceDuration();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/waiter-performance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWaiterPerformance() {
        Map<String, Object> data = analyticsService.getWaiterPerformance();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenue() {
        Map<String, Object> data = analyticsService.getRevenue();
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
