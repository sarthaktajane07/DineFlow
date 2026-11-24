package com.dineflow.backend.service;

import com.dineflow.backend.dto.NotifyRequest;
import com.dineflow.backend.dto.SeatRequest;
import com.dineflow.backend.dto.WaitlistRequest;
import com.dineflow.backend.exception.BadRequestException;
import com.dineflow.backend.model.Table;
import com.dineflow.backend.model.WaitlistEntry;
import com.dineflow.backend.repository.ServiceHistoryRepository;
import com.dineflow.backend.repository.TableRepository;
import com.dineflow.backend.repository.UserRepository;
import com.dineflow.backend.repository.WaitlistRepository;
import com.dineflow.backend.websocket.WebSocketEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WaitlistServiceTest {

    @Mock
    private WaitlistRepository waitlistRepository;

    @Mock
    private TableRepository tableRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ServiceHistoryRepository serviceHistoryRepository;

    @Mock
    private TwilioService twilioService;

    @Mock
    private ActivityService activityService;

    @Mock
    private TableService tableService;

    @Mock
    private WebSocketEventPublisher wsPublisher;

    @InjectMocks
    private WaitlistService waitlistService;

    private WaitlistEntry entry;
    private Table table;

    @BeforeEach
    void setUp() {
        entry = new WaitlistEntry();
        entry.setId("w1");
        entry.setGuestName("Alice Smith");
        entry.setPhoneNumber("+1234567890");
        entry.setPartySize(3);
        entry.setStatus("waiting");
        entry.setCreatedAt(Instant.now());

        table = new Table();
        table.setId("t1");
        table.setTableNumber("4");
        table.setSeats(4);
        table.setStatus("free");
    }

    @Test
    void testAddToWaitlist() {
        WaitlistRequest req = new WaitlistRequest();
        req.setGuestName("Alice Smith");
        req.setPhoneNumber("+1234567890");
        req.setPartySize(3);

        when(waitlistRepository.save(any(WaitlistEntry.class))).thenReturn(entry);
        when(twilioService.sendWaitlistConfirmation(anyString(), anyString(), anyInt(), anyInt(), any()))
                .thenReturn(Map.of("success", true, "mock", true));

        Map<String, Object> result = waitlistService.addToWaitlist(req, "userId");

        assertNotNull(result);
        assertTrue(result.containsKey("entry"));
        assertTrue(result.containsKey("notification"));
        verify(wsPublisher).emitWaitlistAdded(any());
    }

    @Test
    void testNotifyGuest_Success() {
        NotifyRequest req = new NotifyRequest();
        req.setTableNumber("4");

        when(waitlistRepository.findById("w1")).thenReturn(Optional.of(entry));
        when(waitlistRepository.save(any(WaitlistEntry.class))).thenReturn(entry);
        when(twilioService.notifyTableReady(anyString(), anyString(), anyString(), any()))
                .thenReturn(Map.of("success", true));

        Map<String, Object> result = waitlistService.notifyGuest("w1", req, "userId");

        assertNotNull(result);
        verify(twilioService).notifyTableReady("Alice Smith", "+1234567890", "4", "sms");
    }

    @Test
    void testSeatGuest_Success() {
        SeatRequest req = new SeatRequest();
        req.setTableId("t1");

        when(waitlistRepository.findById("w1")).thenReturn(Optional.of(entry));
        when(tableRepository.findById("t1")).thenReturn(Optional.of(table));
        when(waitlistRepository.save(any(WaitlistEntry.class))).thenReturn(entry);
        when(tableRepository.save(any(Table.class))).thenReturn(table);
        when(tableService.populateTable(any(Table.class))).thenReturn(Map.of("_id", "t1", "status", "occupied"));

        Map<String, Object> result = waitlistService.seatGuest("w1", req, "userId");

        assertNotNull(result);
        assertEquals("seated", entry.getStatus());
        assertEquals("occupied", table.getStatus());
        verify(serviceHistoryRepository).save(any());
    }

    @Test
    void testSeatGuest_TableNotFree() {
        table.setStatus("occupied");
        SeatRequest req = new SeatRequest();
        req.setTableId("t1");

        when(waitlistRepository.findById("w1")).thenReturn(Optional.of(entry));
        when(tableRepository.findById("t1")).thenReturn(Optional.of(table));

        assertThrows(BadRequestException.class, () -> waitlistService.seatGuest("w1", req, "userId"));
    }
}
