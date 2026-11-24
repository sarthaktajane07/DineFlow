package com.dineflow.backend.service;

import com.dineflow.backend.dto.TableRequest;
import com.dineflow.backend.exception.BadRequestException;
import com.dineflow.backend.exception.ResourceNotFoundException;
import com.dineflow.backend.model.ActivityLog;
import com.dineflow.backend.model.Table;
import com.dineflow.backend.model.User;
import com.dineflow.backend.model.WaitlistEntry;
import com.dineflow.backend.repository.TableRepository;
import com.dineflow.backend.repository.UserRepository;
import com.dineflow.backend.repository.WaitlistRepository;
import com.dineflow.backend.websocket.WebSocketEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRepository tableRepository;
    private final UserRepository userRepository;
    private final WaitlistRepository waitlistRepository;
    private final ActivityService activityService;
    private final WebSocketEventPublisher wsPublisher;

    public List<Map<String, Object>> getTables(String status, String zone, Boolean isActive) {
        List<Table> tables;

        if (status != null && zone != null) {
            tables = tableRepository.findByStatusAndZoneAndIsActiveTrue(status, zone);
        } else if (status != null) {
            tables = tableRepository.findByStatusAndIsActiveTrue(status);
        } else if (zone != null) {
            tables = tableRepository.findByZoneAndIsActiveTrue(zone);
        } else if (isActive != null) {
            tables = isActive ? tableRepository.findByIsActiveTrue() : tableRepository.findAll();
        } else {
            tables = tableRepository.findAllByOrderByTableNumberAsc();
        }

        return tables.stream()
                .sorted(Comparator.comparing(Table::getTableNumber))
                .map(this::populateTable)
                .toList();
    }

    public Map<String, Object> getTable(String id) {
        Table table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        return populateTable(table);
    }

    public Map<String, Object> createTable(TableRequest request, String userId) {
        Table table = new Table();
        table.setTableNumber(request.getTableNumber());
        table.setSeats(request.getSeats());
        if (request.getStatus() != null) table.setStatus(request.getStatus());
        if (request.getZone() != null) table.setZone(request.getZone());
        if (request.getShape() != null) table.setShape(request.getShape());
        if (request.getAssignedWaiter() != null) table.setAssignedWaiter(request.getAssignedWaiter());
        if (request.getPosition() != null) {
            table.setPosition(new Table.TablePosition(request.getPosition().getX(), request.getPosition().getY()));
        }

        table = tableRepository.save(table);

        wsPublisher.emitTableCreated(populateTable(table));

        ActivityLog.Metadata meta = new ActivityLog.Metadata();
        meta.setTableId(table.getId());
        activityService.logAsync("table", "create",
                "Created Table " + table.getTableNumber() + " (" + table.getSeats() + " seats)",
                userId, meta);

        return populateTable(table);
    }

    public Map<String, Object> updateTable(String id, TableRequest request, String userId) {
        Table table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (request.getStatus() != null) {
            table.setStatus(request.getStatus());
            if ("occupied".equals(request.getStatus()) && table.getOccupiedAt() == null) {
                table.setOccupiedAt(Instant.now());
            } else if ("free".equals(request.getStatus())) {
                table.setOccupiedAt(null);
                table.setCurrentGuest(null);
            }
        }
        if (request.getAssignedWaiter() != null) table.setAssignedWaiter(request.getAssignedWaiter());
        if (request.getPosition() != null) {
            table.setPosition(new Table.TablePosition(request.getPosition().getX(), request.getPosition().getY()));
        }
        if (request.getZone() != null) table.setZone(request.getZone());
        if (request.getShape() != null) table.setShape(request.getShape());

        table = tableRepository.save(table);
        Map<String, Object> populated = populateTable(table);

        wsPublisher.emitTableUpdated(populated);

        String desc = "Updated Table " + table.getTableNumber();
        if (request.getStatus() != null) desc += " status to " + request.getStatus();
        ActivityLog.Metadata meta = new ActivityLog.Metadata();
        meta.setTableId(table.getId());
        activityService.logAsync("table", "update", desc, userId, meta);

        return populated;
    }

    public void deleteTable(String id, String userId) {
        Table table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if ("occupied".equals(table.getStatus())) {
            throw new BadRequestException("Cannot delete an occupied table");
        }

        tableRepository.delete(table);

        wsPublisher.emitTableDeleted(id);

        ActivityLog.Metadata meta = new ActivityLog.Metadata();
        meta.setTableId(id);
        activityService.logAsync("table", "delete",
                "Deleted Table " + table.getTableNumber(), userId, meta);
    }

    public Map<String, Object> getStats() {
        long total = tableRepository.countByIsActiveTrue();
        long free = tableRepository.countByStatusAndIsActiveTrue("free");
        long occupied = tableRepository.countByStatusAndIsActiveTrue("occupied");
        long reserved = tableRepository.countByStatusAndIsActiveTrue("reserved");
        long cleaning = tableRepository.countByStatusAndIsActiveTrue("cleaning");
        double occupancyRate = total > 0 ? Math.round(((double) occupied / total) * 1000.0) / 10.0 : 0;

        return Map.of(
                "total", total,
                "free", free,
                "occupied", occupied,
                "reserved", reserved,
                "cleaning", cleaning,
                "occupancyRate", occupancyRate
        );
    }

    public Map<String, Object> populateTable(Table table) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("_id", table.getId());
        map.put("tableNumber", table.getTableNumber());
        map.put("seats", table.getSeats());
        map.put("status", table.getStatus());
        map.put("zone", table.getZone());
        map.put("position", table.getPosition());
        map.put("shape", table.getShape());
        map.put("isActive", table.isActive());
        map.put("occupiedAt", table.getOccupiedAt());
        map.put("createdAt", table.getCreatedAt());
        map.put("updatedAt", table.getUpdatedAt());

        // Populate currentGuest
        if (table.getCurrentGuest() != null) {
            waitlistRepository.findById(table.getCurrentGuest()).ifPresentOrElse(
                    entry -> map.put("currentGuest", Map.of(
                            "_id", entry.getId(),
                            "guestName", entry.getGuestName(),
                            "partySize", entry.getPartySize(),
                            "phoneNumber", entry.getPhoneNumber()
                    )),
                    () -> map.put("currentGuest", null)
            );
        } else {
            map.put("currentGuest", null);
        }

        // Populate assignedWaiter
        if (table.getAssignedWaiter() != null) {
            userRepository.findById(table.getAssignedWaiter()).ifPresentOrElse(
                    user -> map.put("assignedWaiter", Map.of(
                            "_id", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail()
                    )),
                    () -> map.put("assignedWaiter", null)
            );
        } else {
            map.put("assignedWaiter", null);
        }

        return map;
    }
}
