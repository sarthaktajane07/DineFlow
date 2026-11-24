package com.dineflow.backend.repository;

import com.dineflow.backend.model.Table;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TableRepository extends MongoRepository<Table, String> {
    List<Table> findByStatusAndIsActiveTrue(String status);
    List<Table> findByZoneAndIsActiveTrue(String zone);
    List<Table> findByStatusAndZoneAndIsActiveTrue(String status, String zone);
    List<Table> findByIsActiveTrue();
    List<Table> findAllByOrderByTableNumberAsc();
    long countByIsActiveTrue();
    long countByStatusAndIsActiveTrue(String status);
    Optional<Table> findByTableNumber(String tableNumber);
}
