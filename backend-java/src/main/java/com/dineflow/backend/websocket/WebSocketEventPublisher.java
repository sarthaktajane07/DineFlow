package com.dineflow.backend.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    private static final String TOPIC = "/topic/all";

    public void publish(String event, Object payload) {
        Map<String, Object> message = Map.of(
                "event", event,
                "payload", payload,
                "timestamp", Instant.now().toString()
        );
        try {
            messagingTemplate.convertAndSend(TOPIC, message);
            log.debug("Published WebSocket event: {}", event);
        } catch (Exception e) {
            log.error("Failed to publish WebSocket event {}: {}", event, e.getMessage());
        }
    }

    // Convenience methods matching Node socket handler events
    public void emitTableCreated(Object table) {
        publish("table:created", Map.of("table", table, "timestamp", Instant.now().toString()));
    }

    public void emitTableUpdated(Object table) {
        publish("table:updated", Map.of("table", table, "timestamp", Instant.now().toString()));
    }

    public void emitTableDeleted(String tableId) {
        publish("table:deleted", Map.of("tableId", tableId, "timestamp", Instant.now().toString()));
    }

    public void emitWaitlistAdded(Object entry) {
        publish("waitlist:added", Map.of("entry", entry, "timestamp", Instant.now().toString()));
    }

    public void emitWaitlistUpdated(Object entry) {
        publish("waitlist:updated", Map.of("entry", entry, "timestamp", Instant.now().toString()));
    }

    public void emitWaitlistRemoved(String entryId) {
        publish("waitlist:removed", Map.of("entryId", entryId, "timestamp", Instant.now().toString()));
    }

    public void emitGuestSeated(Object entry, Object table) {
        publish("guest:seated", Map.of("entry", entry, "table", table, "timestamp", Instant.now().toString()));
    }

    public void emitGuestSeated(Object data) {
        publish("guest:seated", data);
    }

    public void emitNotificationSent(Object data) {
        publish("notification:sent", data);
    }

    public void emitActivity(Object activity) {
        publish("activity:new", Map.of("activity", activity, "timestamp", Instant.now().toString()));
    }
}
