package com.dineflow.backend.repository;

import com.dineflow.backend.model.WaitlistEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface WaitlistRepository extends MongoRepository<WaitlistEntry, String> {
    List<WaitlistEntry> findByStatusOrderByCreatedAtAsc(String status);
    List<WaitlistEntry> findByPriorityOrderByCreatedAtAsc(String priority);
    List<WaitlistEntry> findByStatusAndPriorityOrderByCreatedAtAsc(String status, String priority);
    List<WaitlistEntry> findAllByOrderByCreatedAtAsc();
    long countByStatus(String status);
    long countByStatusAndSeatedAtAfter(String status, Instant after);
    List<WaitlistEntry> findByStatusAndSeatedAtAfter(String status, Instant after);
    long countByStatusAndCreatedAtBefore(String status, Instant before);
}
