package com.dineflow.backend.service;

import com.dineflow.backend.dto.TableRequest;
import com.dineflow.backend.exception.BadRequestException;
import com.dineflow.backend.exception.ResourceNotFoundException;
import com.dineflow.backend.model.Table;
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

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TableServiceTest {

    @Mock
    private TableRepository tableRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WaitlistRepository waitlistRepository;

    @Mock
    private ActivityService activityService;

    @Mock
    private WebSocketEventPublisher wsPublisher;

    @InjectMocks
    private TableService tableService;

    private Table table;

    @BeforeEach
    void setUp() {
        table = new Table();
        table.setId("t1");
        table.setTableNumber("5");
        table.setSeats(4);
        table.setStatus("free");
        table.setZone("indoor");
        table.setActive(true);
    }

    @Test
    void testGetTables() {
        when(tableRepository.findAllByOrderByTableNumberAsc()).thenReturn(List.of(table));

        List<Map<String, Object>> result = tableService.getTables(null, null, null);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("5", result.get(0).get("tableNumber"));
    }

    @Test
    void testCreateTable() {
        TableRequest req = new TableRequest();
        req.setTableNumber("10");
        req.setSeats(6);
        req.setZone("vip");

        when(tableRepository.save(any(Table.class))).thenReturn(table);

        Map<String, Object> result = tableService.createTable(req, "adminId");

        assertNotNull(result);
        verify(tableRepository).save(any(Table.class));
        verify(wsPublisher).emitTableCreated(any());
    }

    @Test
    void testDeleteTable_OccupiedFails() {
        table.setStatus("occupied");
        when(tableRepository.findById("t1")).thenReturn(Optional.of(table));

        assertThrows(BadRequestException.class, () -> tableService.deleteTable("t1", "adminId"));
    }

    @Test
    void testDeleteTable_FreeSuccess() {
        when(tableRepository.findById("t1")).thenReturn(Optional.of(table));

        tableService.deleteTable("t1", "adminId");

        verify(tableRepository).delete(table);
        verify(wsPublisher).emitTableDeleted("t1");
    }
}
