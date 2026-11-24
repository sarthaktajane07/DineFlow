package com.dineflow.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class SeatRequest {
    @NotBlank(message = "tableId is required")
    private String tableId;
}
