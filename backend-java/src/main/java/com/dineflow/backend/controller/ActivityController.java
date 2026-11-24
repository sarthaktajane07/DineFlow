package com.dineflow.backend.controller;

import com.dineflow.backend.dto.ApiResponse;
import com.dineflow.backend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getActivities(
            @RequestParam(defaultValue = "50") int limit) {
        List<Map<String, Object>> activities = activityService.getRecentEnriched(limit);
        return ResponseEntity.ok(ApiResponse.success(activities.size(), Map.of("activities", activities)));
    }
}
