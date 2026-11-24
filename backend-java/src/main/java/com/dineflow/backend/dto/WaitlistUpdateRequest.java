package com.dineflow.backend.dto;

import lombok.Data;

@Data
public class WaitlistUpdateRequest {
    private String status;
    private Integer estimatedWaitTime;
    private String notes;
    private String priority;
}
