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
@Document(collection = "servicehistories")
@CompoundIndexes({
    @CompoundIndex(name = "table_date_idx", def = "{'table': 1, 'date': -1}"),
    @CompoundIndex(name = "waiter_date_idx", def = "{'waiter': 1, 'date': -1}"),
    @CompoundIndex(name = "shift_dow_idx", def = "{'shift': 1, 'dayOfWeek': 1}")
})
public class ServiceHistory {

    @Id
    private String id;

    private String table; // ref to Table id

    private String waitlistEntry; // ref to WaitlistEntry id

    private String waiter; // ref to User id

    private String guestName;

    private int partySize;

    private Instant seatedAt;

    private Instant leftAt;

    private Integer serviceDuration; // in minutes

    private int waitTime; // in minutes

    private Instant date;

    private String dayOfWeek; // Monday, Tuesday, ...

    private String shift; // breakfast, lunch, dinner, late-night

    private double revenue = 0;

    private Integer rating; // 1-5

    private String notes;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
