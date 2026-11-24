package com.dineflow.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tables")
@CompoundIndexes({
    @CompoundIndex(name = "status_zone_idx", def = "{'status': 1, 'zone': 1}")
})
public class Table {

    @Id
    private String id;

    private String tableNumber;

    private int seats;

    private String status = "free"; // free, occupied, reserved, cleaning

    private String zone = "main";

    private TablePosition position = new TablePosition();

    private String shape = "square"; // square, round, rectangle

    private String currentGuest; // ref to WaitlistEntry id

    private String assignedWaiter; // ref to User id

    private Instant occupiedAt;

    private boolean isActive = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TablePosition {
        private double x = 0;
        private double y = 0;
    }
}
