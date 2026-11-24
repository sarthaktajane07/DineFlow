package com.dineflow.backend.config;

import com.dineflow.backend.model.Table;
import com.dineflow.backend.model.User;
import com.dineflow.backend.repository.TableRepository;
import com.dineflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TableRepository tableRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedTables();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("👥 Database empty. Seeding default users...");

            User admin = new User();
            admin.setFullName("Admin User");
            admin.setEmail("admin@dineflow.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("manager");
            admin.setActive(true);
            admin = userRepository.save(admin);

            User host = new User();
            host.setFullName("Host User");
            host.setEmail("host@dineflow.com");
            host.setPassword(passwordEncoder.encode("host123"));
            host.setRole("host");
            host.setActive(true);
            host.setCreatedBy(admin.getId());
            userRepository.save(host);

            User staff = new User();
            staff.setFullName("Staff User");
            staff.setEmail("staff@dineflow.com");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setRole("staff");
            staff.setActive(true);
            staff.setCreatedBy(admin.getId());
            userRepository.save(staff);

            log.info("✅ Default users created: admin@dineflow.com, host@dineflow.com, staff@dineflow.com");
        }
    }

    private void seedTables() {
        if (tableRepository.count() == 0) {
            log.info("📋 Database empty. Seeding sample tables...");

            List<Table> tables = List.of(
                    createTable("1", 2, "indoor", 100, 100, "square"),
                    createTable("2", 2, "indoor", 200, 100, "square"),
                    createTable("3", 4, "indoor", 300, 100, "square"),
                    createTable("4", 4, "indoor", 100, 200, "round"),
                    createTable("5", 6, "indoor", 200, 200, "rectangle"),
                    createTable("6", 4, "outdoor", 300, 200, "square"),
                    createTable("7", 2, "bar", 100, 300, "square"),
                    createTable("8", 8, "vip", 200, 300, "rectangle")
            );

            tableRepository.saveAll(tables);
            log.info("✅ 8 sample tables created successfully");
        }
    }

    private Table createTable(String number, int seats, String zone, double x, double y, String shape) {
        Table table = new Table();
        table.setTableNumber(number);
        table.setSeats(seats);
        table.setZone(zone);
        table.setPosition(new Table.TablePosition(x, y));
        table.setShape(shape);
        table.setStatus("free");
        table.setActive(true);
        return table;
    }
}
