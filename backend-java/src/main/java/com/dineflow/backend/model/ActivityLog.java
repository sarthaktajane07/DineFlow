package com.dineflow.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "activitylogs")
public class ActivityLog {

    @Id
    private String id;

    private String type; // table, waitlist, notification, auth, system

    private String action;

    private String description;

    private String performedBy; // ref to User id

    private Metadata metadata = new Metadata();

    @Indexed
    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Metadata {
        private String tableId;
        private String waitlistId;
        private String targetName;
    }
}
