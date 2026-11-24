package com.dineflow.backend.service;

import com.dineflow.backend.model.ActivityLog;
import com.dineflow.backend.model.User;
import com.dineflow.backend.repository.ActivityLogRepository;
import com.dineflow.backend.repository.UserRepository;
import com.dineflow.backend.websocket.WebSocketEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final WebSocketEventPublisher wsPublisher;

    public ActivityLog log(String type, String action, String description,
                           String userId, ActivityLog.Metadata metadata) {
        try {
            ActivityLog activity = new ActivityLog();
            activity.setType(type);
            activity.setAction(action);
            activity.setDescription(description);
            activity.setPerformedBy(userId);
            activity.setMetadata(metadata != null ? metadata : new ActivityLog.Metadata());

            activity = activityLogRepository.save(activity);

            // Build enriched map for websocket
            Map<String, Object> activityMap = buildActivityMap(activity, userId);
            wsPublisher.emitActivity(activityMap);

            return activity;
        } catch (Exception e) {
            log.error("Error logging activity: {}", e.getMessage());
            return null;
        }
    }

    @Async
    public void logAsync(String type, String action, String description,
                         String userId, ActivityLog.Metadata metadata) {
        log(type, action, description, userId, metadata);
    }

    public List<Map<String, Object>> getRecentEnriched(int limit) {
        List<ActivityLog> logs = activityLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
        List<Map<String, Object>> result = new ArrayList<>();
        for (ActivityLog logItem : logs) {
            result.add(buildActivityMap(logItem, logItem.getPerformedBy()));
        }
        return result;
    }

    private Map<String, Object> buildActivityMap(ActivityLog activity, String userId) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("_id", activity.getId());
        map.put("id", activity.getId());
        map.put("type", activity.getType());
        map.put("action", activity.getAction());
        map.put("description", activity.getDescription());
        map.put("createdAt", activity.getCreatedAt());
        map.put("metadata", activity.getMetadata());

        if (userId != null) {
            userRepository.findById(userId).ifPresentOrElse(
                    user -> map.put("performedBy", Map.of(
                            "_id", user.getId(),
                            "id", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail()
                    )),
                    () -> map.put("performedBy", null)
            );
        } else {
            map.put("performedBy", null);
        }

        return map;
    }
}
