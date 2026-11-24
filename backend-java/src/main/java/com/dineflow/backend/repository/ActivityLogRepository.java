package com.dineflow.backend.repository;

import com.dineflow.backend.model.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
