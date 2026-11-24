package com.dineflow.backend.service;

import com.dineflow.backend.dto.DeleteWaitlistRequest;
import com.dineflow.backend.dto.NotifyRequest;
import com.dineflow.backend.dto.SeatRequest;
import com.dineflow.backend.dto.WaitlistRequest;
import com.dineflow.backend.dto.WaitlistUpdateRequest;
import com.dineflow.backend.exception.BadRequestException;
import com.dineflow.backend.exception.ResourceNotFoundException;
import com.dineflow.backend.model.ActivityLog;
import com.dineflow.backend.model.ServiceHistory;
import com.dineflow.backend.model.Table;
import com.dineflow.backend.model.WaitlistEntry;
import com.dineflow.backend.repository.ServiceHistoryRepository;
import com.dineflow.backend.repository.TableRepository;
import com.dineflow.backend.repository.UserRepository;
import com.dineflow.backend.repository.WaitlistRepository;
import com.dineflow.backend.websocket.WebSocketEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final TableRepository tableRepository;
    private final UserRepository userRepository;
    private final ServiceHistoryRepository serviceHistoryRepository;
    private final TwilioService twilioService;
    private final ActivityService activityService;
    private final TableService tableService;
    private final WebSocketEventPublisher wsPublisher;

    public List<Map<String, Object>> getWaitlist(String status, String priority) {
        List<WaitlistEntry> entries;

        if (status != null && priority != null) {
            entries = waitlistRepository.findByStatusAndPriorityOrderByCreatedAtAsc(status, priority);
        } else if (status != null) {
            entries = waitlistRepository.findByStatusOrderByCreatedAtAsc(status);
        } else if (priority != null) {
            entries = waitlistRepository.findByPriorityOrderByCreatedAtAsc(priority);
        } else {
            entries = waitlistRepository.findAllByOrderByCreatedAtAsc();
        }

        return entries.stream()
                .map(this::populateEntry)
                .toList();
    }

    public Map<String, Object> getWaitlistEntry(String id) {
        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found"));
        return populateEntry(entry);
    }

    public Map<String, Object> addToWaitlist(WaitlistRequest request, String userId) {
        WaitlistEntry entry = new WaitlistEntry();
        entry.setGuestName(request.getGuestName());
        entry.setPhoneNumber(request.getPhoneNumber());
        entry.setPartySize(request.getPartySize());
        if (request.getPriority() != null) entry.setPriority(request.getPriority());
        if (request.getNotificationPreference() != null) entry.setNotificationPreference(request.getNotificationPreference());
        entry.setNotes(request.getNotes());
        entry.setEstimatedWaitTime(request.getEstimatedWaitTime() != null ? request.getEstimatedWaitTime() : 0);
        entry.setAddedBy(userId);

        entry = waitlistRepository.save(entry);

        int waitTime = entry.getEstimatedWaitTime() > 0 ? entry.getEstimatedWaitTime() : 15;
        Map<String, Object> notifResult = twilioService.sendWaitlistConfirmation(
                entry.getGuestName(),
                entry.getPhoneNumber(),
                entry.getPartySize(),
                waitTime,
                entry.getNotificationPreference()
        );

        Map<String, Object> populated = populateEntry(entry);
        wsPublisher.emitWaitlistAdded(populated);

        ActivityLog.Metadata meta = new ActivityLog.Metadata();
        meta.setWaitlistId(entry.getId());
        meta.setTargetName(entry.getGuestName());
        activityService.logAsync("waitlist", "add",
                "Added " + entry.getGuestName() + " (Party of " + entry.getPartySize() + ") to waitlist",
                userId, meta);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("entry", populated);
        res.put("notification", notifResult);
        return res;
    }

    public Map<String, Object> updateWaitlistEntry(String id, WaitlistUpdateRequest request, String userId) {
        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found"));

        if (request.getStatus() != null) entry.setStatus(request.getStatus());
        if (request.getEstimatedWaitTime() != null) entry.setEstimatedWaitTime(request.getEstimatedWaitTime());
        if (request.getNotes() != null) entry.setNotes(request.getNotes());
        if (request.getPriority() != null) entry.setPriority(request.getPriority());

        entry = waitlistRepository.save(entry);
        Map<String, Object> populated = populateEntry(entry);

        wsPublisher.emitWaitlistUpdated(populated);

        ActivityLog.Metadata meta = new ActivityLog.Metadata();
        meta.setWaitlistId(entry.getId());
        meta.setTargetName(entry.getGuestName());
        activityService.logAsync("waitlist", "update",
                "Updated waitlist entry for " + entry.getGuestName(), userId, meta);

        return populated;
    }

    public Map<String, Object> notifyGuest(String id, NotifyRequest request, String userId) {
        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found"));

        if (!"waiting".equals(entry.getStatus())) {
            throw new BadRequestException("Can only notify guests with waiting status");
        }

        String tableNumber = request != null ? request.getTableNumber() : null;
        String preference = (request != null && request.getPreference() != null)
                ? request.getPreference()
                : (entry.getNotificationPreference() != null ? entry.getNotificationPreference() : "sms");

        Map<String, Object> notifResult = twilioService.notifyTableReady(
                entry.getGuestName(),
                entry.getPhoneNumber(),
                tableNumber,
                preference
        );

        entry.setStatus("notified");
        entry.setNotifiedAt(Instant.now());
        entry = waitlistRepository.save(entry);

        Map<String, Object> populated = populateEntry(entry);

        Map<String, Object> notifData = new LinkedHashMap<>();
        notifData.put("entryId", entry.getId());
        notifData.put("guestName", entry.getGuestName());
        notifData.put("tableNumber", tableNumber);
        notifData.put("result", notifResult);
        wsPublisher.emitNotificationSent(notifData);

        wsPublisher.emitWaitlistUpdated(populated);

        ActivityLog.Metadata meta = new ActivityLog.Metadata();
        meta.setWaitlistId(entry.getId());
        meta.setTargetName(entry.getGuestName());
        activityService.logAsync("notification", "send",
                "Notified " + entry.getGuestName() + (tableNumber != null ? " for Table " + tableNumber : "") + " via " + preference,
                userId, meta);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("entry", populated);
        res.put("notification", notifResult);
        return res;
    }

    public Map<String, Object> seatGuest(String id, SeatRequest request, String userId) {
        if (request == null || request.getTableId() == null) {
            throw new BadRequestException("Table ID is required");
        }

        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found"));

        Table table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (!"free".equals(table.getStatus())) {
            throw new BadRequestException("Table is not available");
        }

        Instant now = Instant.now();
        int waitTimeMinutes = (entry.getCreatedAt() != null)
                ? (int) Duration.between(entry.getCreatedAt(), now).toMinutes()
                : (entry.getEstimatedWaitTime() > 0 ? entry.getEstimatedWaitTime() : 15);

        entry.setStatus("seated");
        entry.setAssignedTable(table.getId());
        entry.setSeatedAt(now);
        entry.setActualWaitTime(waitTimeMinutes);
        entry = waitlistRepository.save(entry);

        table.setStatus("occupied");
        table.setCurrentGuest(entry.getId());
        table.setOccupiedAt(now);
        table = tableRepository.save(table);

        // Record ServiceHistory
        ServiceHistory sh = new ServiceHistory();
        sh.setTable(table.getId());
        sh.setWaitlistEntry(entry.getId());
        sh.setWaiter(table.getAssignedWaiter() != null ? table.getAssignedWaiter() : userId);
        sh.setGuestName(entry.getGuestName());
        sh.setPartySize(entry.getPartySize());
        sh.setSeatedAt(now);
        sh.setWaitTime(waitTimeMinutes);
        sh.setDate(now);

        ZonedDateTime zdt = now.atZone(ZoneOffset.UTC);
        DayOfWeek dow = zdt.getDayOfWeek();
        sh.setDayOfWeek(dow.name().charAt(0) + dow.name().substring(1).toLowerCase());

        int hour = zdt.getHour();
        if (hour >= 6 && hour < 11) sh.setShift("breakfast");
        else if (hour >= 11 && hour < 16) sh.setShift("lunch");
        else if (hour >= 16 && hour < 22) sh.setShift("dinner");
        else sh.setShift("late-night");

        serviceHistoryRepository.save(sh);

        Map<String, Object> populatedEntry = populateEntry(entry);
        Map<String, Object> populatedTable = tableService.populateTable(table);

        Map<String, Object> seatedPayload = new LinkedHashMap<>();
        seatedPayload.put("entry", populatedEntry);
        seatedPayload.put("table", populatedTable);
        wsPublisher.emitGuestSeated(seatedPayload);

        wsPublisher.emitWaitlistUpdated(populatedEntry);
        wsPublisher.emitTableUpdated(populatedTable);

        ActivityLog.Metadata meta = new ActivityLog.Metadata();
        meta.setWaitlistId(entry.getId());
        meta.setTableId(table.getId());
        meta.setTargetName(entry.getGuestName());
        activityService.logAsync("waitlist", "seat",
                "Seated " + entry.getGuestName() + " at Table " + table.getTableNumber(),
                userId, meta);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("entry", populatedEntry);
        res.put("table", populatedTable);
        return res;
    }

    public void removeFromWaitlist(String id, DeleteWaitlistRequest request, String userId) {
        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found"));

        String reason = (request != null) ? request.getReason() : null;

        if ("no-show".equals(reason)) {
            entry.setStatus("no-show");
            waitlistRepository.save(entry);
        } else if ("cancelled".equals(reason)) {
            entry.setStatus("cancelled");
            entry.setCancelledAt(Instant.now());
            waitlistRepository.save(entry);
        } else {
            waitlistRepository.delete(entry);
        }

        wsPublisher.emitWaitlistRemoved(id);

        ActivityLog.Metadata meta = new ActivityLog.Metadata();
        meta.setWaitlistId(id);
        meta.setTargetName(entry.getGuestName());
        activityService.logAsync("waitlist", "remove",
                "Removed " + entry.getGuestName() + " from waitlist (" + (reason != null ? reason : "manual") + ")",
                userId, meta);
    }

    public Map<String, Object> getStats() {
        long waiting = waitlistRepository.countByStatus("waiting");
        long notified = waitlistRepository.countByStatus("notified");

        Instant startOfToday = Instant.now().truncatedTo(ChronoUnit.DAYS);
        List<WaitlistEntry> seatedTodayList = waitlistRepository.findByStatusAndSeatedAtAfter("seated", startOfToday);

        double avgWait = 0;
        if (!seatedTodayList.isEmpty()) {
            double sum = seatedTodayList.stream()
                    .mapToInt(e -> e.getActualWaitTime() != null ? e.getActualWaitTime() : 0)
                    .sum();
            avgWait = sum / seatedTodayList.size();
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("waiting", waiting);
        stats.put("notified", notified);
        stats.put("seatedToday", seatedTodayList.size());
        stats.put("averageWaitTime", Math.round(avgWait));
        stats.put("totalGuests", waiting + notified);

        return stats;
    }

    public Map<String, Object> populateEntry(WaitlistEntry entry) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("_id", entry.getId());
        map.put("guestName", entry.getGuestName());
        map.put("phoneNumber", entry.getPhoneNumber());
        map.put("partySize", entry.getPartySize());
        map.put("status", entry.getStatus());
        map.put("priority", entry.getPriority());
        map.put("estimatedWaitTime", entry.getEstimatedWaitTime());
        map.put("notificationPreference", entry.getNotificationPreference());
        map.put("notes", entry.getNotes());
        map.put("notifiedAt", entry.getNotifiedAt());
        map.put("seatedAt", entry.getSeatedAt());
        map.put("cancelledAt", entry.getCancelledAt());
        map.put("actualWaitTime", entry.getActualWaitTime());
        map.put("createdAt", entry.getCreatedAt());
        map.put("updatedAt", entry.getUpdatedAt());

        // Queue position
        if ("waiting".equals(entry.getStatus()) && entry.getCreatedAt() != null) {
            long pos = waitlistRepository.countByStatusAndCreatedAtBefore("waiting", entry.getCreatedAt()) + 1;
            map.put("queuePosition", pos);
        } else {
            map.put("queuePosition", 0);
        }

        // Assigned table
        if (entry.getAssignedTable() != null) {
            tableRepository.findById(entry.getAssignedTable()).ifPresentOrElse(
                    tbl -> map.put("assignedTable", Map.of(
                            "_id", tbl.getId(),
                            "tableNumber", tbl.getTableNumber(),
                            "seats", tbl.getSeats()
                    )),
                    () -> map.put("assignedTable", null)
            );
        } else {
            map.put("assignedTable", null);
        }

        // Added by
        if (entry.getAddedBy() != null) {
            userRepository.findById(entry.getAddedBy()).ifPresentOrElse(
                    u -> map.put("addedBy", Map.of(
                            "_id", u.getId(),
                            "fullName", u.getFullName()
                    )),
                    () -> map.put("addedBy", null)
            );
        } else {
            map.put("addedBy", null);
        }

        return map;
    }
}
