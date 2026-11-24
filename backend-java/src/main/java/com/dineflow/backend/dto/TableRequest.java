package com.dineflow.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class TableRequest {
    @NotBlank(message = "Table number is required")
    private String tableNumber;

    @NotNull
    @Min(value = 1, message = "Table must have at least 1 seat")
    @Max(value = 20, message = "Table cannot have more than 20 seats")
    private Integer seats;

    private String status;
    private String zone = "main";
    private PositionDto position;
    private String shape = "square";
    private String assignedWaiter;

    @Data
    public static class PositionDto {
        private double x = 0;
        private double y = 0;
    }
}
