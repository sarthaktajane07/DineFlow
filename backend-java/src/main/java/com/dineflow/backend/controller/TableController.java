package com.dineflow.backend.controller;

import com.dineflow.backend.dto.ApiResponse;
import com.dineflow.backend.dto.TableRequest;
import com.dineflow.backend.service.TableService;
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
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTables(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) Boolean isActive) {
        List<Map<String, Object>> tables = tableService.getTables(status, zone, isActive);
        return ResponseEntity.ok(ApiResponse.success(tables.size(), Map.of("tables", tables)));
    }

    @GetMapping("/stats/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTableStats() {
        Map<String, Object> stats = tableService.getStats();
        return ResponseEntity.ok(ApiResponse.success(Map.of("stats", stats)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTable(@PathVariable String id) {
        Map<String, Object> table = tableService.getTable(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("table", table)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'HOST', 'STAFF')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTable(
            @Valid @RequestBody TableRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> table = tableService.createTable(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Table created successfully", Map.of("table", table)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateTable(
            @PathVariable String id,
            @RequestBody TableRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> table = tableService.updateTable(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Table updated successfully", Map.of("table", table)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteTable(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        tableService.deleteTable(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Table deleted successfully", null));
    }
}
