package com.dineflow.backend.service;

import com.dineflow.backend.model.ServiceHistory;
import com.dineflow.backend.model.User;
import com.dineflow.backend.repository.ServiceHistoryRepository;
import com.dineflow.backend.repository.TableRepository;
import com.dineflow.backend.repository.UserRepository;
import com.dineflow.backend.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ServiceHistoryRepository serviceHistoryRepository;
    private final TableRepository tableRepository;
    private final UserRepository userRepository;
    private final WaitlistRepository waitlistRepository;
    private final TableService tableService;
    private final WaitlistService waitlistService;

    public Map<String, Object> getOverview() {
        Map<String, Object> tableStats = tableService.getStats();
        Map<String, Object> waitlistStats = waitlistService.getStats();

        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        List<ServiceHistory> historyList = serviceHistoryRepository.findByDateAfter(thirtyDaysAgo);

        double totalRevenue = historyList.stream().mapToDouble(ServiceHistory::getRevenue).sum();
        long totalGuestsSeated = historyList.stream().mapToLong(ServiceHistory::getPartySize).sum();

        double avgServiceDuration = 0;
        List<ServiceHistory> withDuration = historyList.stream()
                .filter(h -> h.getServiceDuration() != null && h.getServiceDuration() > 0)
                .toList();
        if (!withDuration.isEmpty()) {
            avgServiceDuration = withDuration.stream()
                    .mapToInt(ServiceHistory::getServiceDuration)
                    .average().orElse(0);
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("occupancyRate", tableStats.get("occupancyRate"));
        res.put("avgWaitTime", waitlistStats.get("averageWaitTime"));
        res.put("avgServiceDuration", Math.round(avgServiceDuration));
        res.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        res.put("totalGuestsSeated", totalGuestsSeated);
        res.put("totalTables", tableStats.get("total"));
        res.put("occupiedTables", tableStats.get("occupied"));
        res.put("waitingGuests", waitlistStats.get("waiting"));

        return res;
    }

    public Map<String, Object> getOccupancy() {
        Map<String, Object> tableStats = tableService.getStats();

        // Zone breakdown
        Map<String, Long> zoneCounts = tableRepository.findByIsActiveTrue().stream()
                .collect(Collectors.groupingBy(t -> t.getZone() != null ? t.getZone() : "main", Collectors.counting()));

        Map<String, Long> zoneOccupied = tableRepository.findByIsActiveTrue().stream()
                .filter(t -> "occupied".equals(t.getStatus()))
                .collect(Collectors.groupingBy(t -> t.getZone() != null ? t.getZone() : "main", Collectors.counting()));

        List<Map<String, Object>> zoneBreakdown = new ArrayList<>();
        for (String zone : zoneCounts.keySet()) {
            long total = zoneCounts.get(zone);
            long occ = zoneOccupied.getOrDefault(zone, 0L);
            Map<String, Object> z = new LinkedHashMap<>();
            z.put("zone", zone);
            z.put("total", total);
            z.put("occupied", occ);
            z.put("rate", total > 0 ? Math.round(((double) occ / total) * 100.0) : 0);
            zoneBreakdown.add(z);
        }

        // Mock hourly occupancy curve for UI visualization
        List<Map<String, Object>> hourlyOccupancy = new ArrayList<>();
        int[] sampleHours = { 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22 };
        double currentRate = Double.parseDouble(String.valueOf(tableStats.get("occupancyRate")));
        for (int h : sampleHours) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("hour", String.format("%02d:00", h));
            double factor = (h >= 12 && h <= 14) || (h >= 19 && h <= 21) ? 1.2 : 0.6;
            item.put("occupancy", Math.min(100, Math.round(Math.max(20, currentRate * factor))));
            hourlyOccupancy.add(item);
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("currentRate", tableStats.get("occupancyRate"));
        res.put("hourlyOccupancy", hourlyOccupancy);
        res.put("zoneBreakdown", zoneBreakdown);
        return res;
    }

    public Map<String, Object> getWaitTime() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        List<ServiceHistory> historyList = serviceHistoryRepository.findByDateAfter(thirtyDaysAgo);

        // Group by party size ranges
        Map<String, List<Integer>> bySize = new LinkedHashMap<>();
        bySize.put("1-2 guests", new ArrayList<>());
        bySize.put("3-4 guests", new ArrayList<>());
        bySize.put("5-6 guests", new ArrayList<>());
        bySize.put("7+ guests", new ArrayList<>());

        for (ServiceHistory sh : historyList) {
            String key;
            if (sh.getPartySize() <= 2) key = "1-2 guests";
            else if (sh.getPartySize() <= 4) key = "3-4 guests";
            else if (sh.getPartySize() <= 6) key = "5-6 guests";
            else key = "7+ guests";
            bySize.get(key).add(sh.getWaitTime());
        }

        List<Map<String, Object>> byPartySize = new ArrayList<>();
        bySize.forEach((k, v) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("category", k);
            m.put("avgWaitTime", v.isEmpty() ? 15 : Math.round(v.stream().mapToInt(Integer::intValue).average().orElse(15)));
            m.put("count", v.size());
            byPartySize.add(m);
        });

        // Group by shift
        Map<String, List<Integer>> byShiftMap = new LinkedHashMap<>();
        for (ServiceHistory sh : historyList) {
            String shift = sh.getShift() != null ? sh.getShift() : "dinner";
            byShiftMap.computeIfAbsent(shift, k -> new ArrayList<>()).add(sh.getWaitTime());
        }

        List<Map<String, Object>> byShift = new ArrayList<>();
        byShiftMap.forEach((k, v) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("shift", k);
            m.put("avgWaitTime", Math.round(v.stream().mapToInt(Integer::intValue).average().orElse(15)));
            m.put("count", v.size());
            byShift.add(m);
        });

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("byPartySize", byPartySize);
        res.put("byShift", byShift);
        return res;
    }

    public Map<String, Object> getServiceDuration() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        List<ServiceHistory> historyList = serviceHistoryRepository.findByDateAfter(thirtyDaysAgo);

        List<ServiceHistory> withDuration = historyList.stream()
                .filter(h -> h.getServiceDuration() != null && h.getServiceDuration() > 0)
                .toList();

        double avgDuration = withDuration.isEmpty() ? 45.0 :
                withDuration.stream().mapToInt(ServiceHistory::getServiceDuration).average().orElse(45.0);

        // Group by table
        Map<String, List<Integer>> byTable = new LinkedHashMap<>();
        for (ServiceHistory sh : withDuration) {
            if (sh.getTable() != null) {
                byTable.computeIfAbsent(sh.getTable(), k -> new ArrayList<>()).add(sh.getServiceDuration());
            }
        }

        List<Map<String, Object>> tableStats = new ArrayList<>();
        byTable.forEach((tableId, durations) -> {
            tableRepository.findById(tableId).ifPresent(tbl -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("tableNumber", tbl.getTableNumber());
                m.put("seats", tbl.getSeats());
                m.put("avgMinutes", Math.round(durations.stream().mapToInt(Integer::intValue).average().orElse(0)));
                m.put("turnsCount", durations.size());
                tableStats.add(m);
            });
        });

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("avgMinutes", Math.round(avgDuration));
        res.put("tableDurationStats", tableStats);
        return res;
    }

    public Map<String, Object> getWaiterPerformance() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        List<ServiceHistory> historyList = serviceHistoryRepository.findByDateAfter(thirtyDaysAgo);

        Map<String, List<ServiceHistory>> byWaiter = historyList.stream()
                .filter(h -> h.getWaiter() != null)
                .collect(Collectors.groupingBy(ServiceHistory::getWaiter));

        List<Map<String, Object>> waiters = new ArrayList<>();
        List<User> allStaff = userRepository.findAll().stream()
                .filter(u -> "staff".equalsIgnoreCase(u.getRole()) || "host".equalsIgnoreCase(u.getRole()))
                .toList();

        for (User u : allStaff) {
            List<ServiceHistory> shList = byWaiter.getOrDefault(u.getId(), Collections.emptyList());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("waiterId", u.getId());
            m.put("name", u.getFullName());
            m.put("email", u.getEmail());
            m.put("tablesServed", shList.size());
            m.put("revenue", Math.round(shList.stream().mapToDouble(ServiceHistory::getRevenue).sum() * 100.0) / 100.0);
            double avgRating = shList.stream()
                    .filter(h -> h.getRating() != null)
                    .mapToInt(ServiceHistory::getRating)
                    .average().orElse(4.8);
            m.put("avgRating", Math.round(avgRating * 10.0) / 10.0);
            waiters.add(m);
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("waiters", waiters);
        return res;
    }

    public Map<String, Object> getRevenue() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        List<ServiceHistory> historyList = serviceHistoryRepository.findByDateAfter(thirtyDaysAgo);

        // Daily revenue
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Double> dailyMap = new TreeMap<>();
        for (ServiceHistory sh : historyList) {
            if (sh.getDate() != null) {
                String d = dtf.format(sh.getDate().atZone(ZoneOffset.UTC));
                dailyMap.put(d, dailyMap.getOrDefault(d, 0.0) + sh.getRevenue());
            }
        }

        List<Map<String, Object>> dailyRevenue = new ArrayList<>();
        dailyMap.forEach((k, v) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", k);
            m.put("revenue", Math.round(v * 100.0) / 100.0);
            dailyRevenue.add(m);
        });

        // Shift revenue
        Map<String, Double> shiftMap = new LinkedHashMap<>();
        for (ServiceHistory sh : historyList) {
            String s = sh.getShift() != null ? sh.getShift() : "dinner";
            shiftMap.put(s, shiftMap.getOrDefault(s, 0.0) + sh.getRevenue());
        }

        List<Map<String, Object>> shiftRevenue = new ArrayList<>();
        shiftMap.forEach((k, v) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("shift", k);
            m.put("revenue", Math.round(v * 100.0) / 100.0);
            shiftRevenue.add(m);
        });

        double total = historyList.stream().mapToDouble(ServiceHistory::getRevenue).sum();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalRevenue", Math.round(total * 100.0) / 100.0);
        res.put("dailyRevenue", dailyRevenue);
        res.put("shiftRevenue", shiftRevenue);
        return res;
    }
}
