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
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "waitlistentries")
@CompoundIndexes({
    @CompoundIndex(name = "status_createdAt_idx", def = "{'status': 1, 'createdAt': 1}")
})
public class WaitlistEntry {

    @Id
    private String id;

    private String guestName;

    @Indexed
    private String phoneNumber;

    private int partySize;

    private String status = "waiting"; // waiting, notified, seated, cancelled, no-show

    private String priority = "normal"; // normal, vip, reservation

    private int estimatedWaitTime = 0;

    private String notificationPreference = "sms"; // sms, whatsapp, both

    private String notes;

    private String assignedTable; // ref to Table id

    private String addedBy; // ref to User id

    private Instant notifiedAt;

    private Instant seatedAt;

    private Instant cancelledAt;

    private Integer actualWaitTime; // in minutes

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
