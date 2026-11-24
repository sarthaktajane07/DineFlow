package com.dineflow.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class WaitlistRequest {
    @NotBlank(message = "Guest name is required")
    private String guestName;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotNull
    @Min(value = 1, message = "Party size must be at least 1")
    @Max(value = 20, message = "Party size cannot exceed 20")
    private Integer partySize;

    private String priority = "normal";
    private String notificationPreference = "sms";
    private String notes;
    private Integer estimatedWaitTime = 0;
}
