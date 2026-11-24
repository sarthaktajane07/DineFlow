package com.dineflow.backend.dto;

import lombok.Data;

@Data
public class NotifyRequest {
    private String tableNumber;
    private String preference;
}
