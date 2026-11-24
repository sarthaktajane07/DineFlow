package com.dineflow.backend.repository;

import com.dineflow.backend.model.ServiceHistory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

public interface ServiceHistoryRepository extends MongoRepository<ServiceHistory, String> {
    List<ServiceHistory> findByTableAndDateAfter(String table, Instant after);
    List<ServiceHistory> findByWaiterAndDateAfter(String waiter, Instant after);
    List<ServiceHistory> findByDateAfter(Instant after);
}
