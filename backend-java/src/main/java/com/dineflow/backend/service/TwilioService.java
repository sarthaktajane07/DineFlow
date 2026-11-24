package com.dineflow.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
public class TwilioService {

    @Value("${app.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.twilio.auth-token:}")
    private String authToken;

    @Value("${app.twilio.phone-number:}")
    private String phoneNumber;

    @Value("${app.twilio.whatsapp-number:}")
    private String whatsappNumber;

    private boolean configured = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isBlank() && authToken != null && !authToken.isBlank()) {
            try {
                Twilio.init(accountSid, authToken);
                configured = true;
                log.info("Twilio initialized successfully");
            } catch (Exception e) {
                log.warn("Failed to initialize Twilio: {}", e.getMessage());
                configured = false;
            }
        } else {
            log.info("Twilio credentials not configured. SMS/WhatsApp running in mock mode.");
            configured = false;
        }
    }

    public boolean isConfigured() {
        return configured;
    }

    public Map<String, Object> sendSMS(String to, String message) {
        if (!configured) {
            log.info("📱 SMS (Mock): to={}, message={}", to, message);
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("mock", true);
            res.put("messageId", "mock_" + System.currentTimeMillis());
            return res;
        }

        try {
            Message msg = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(phoneNumber),
                    message
            ).create();

            log.info("✅ SMS sent: {}", msg.getSid());
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("messageId", msg.getSid());
            return res;
        } catch (Exception e) {
            log.error("❌ SMS error: {}", e.getMessage());
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", false);
            res.put("error", e.getMessage());
            return res;
        }
    }

    public Map<String, Object> sendWhatsApp(String to, String message) {
        if (!configured) {
            log.info("💬 WhatsApp (Mock): to={}, message={}", to, message);
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("mock", true);
            res.put("messageId", "mock_" + System.currentTimeMillis());
            return res;
        }

        try {
            Message msg = Message.creator(
                    new PhoneNumber("whatsapp:" + to),
                    new PhoneNumber("whatsapp:" + whatsappNumber),
                    message
            ).create();

            log.info("✅ WhatsApp sent: {}", msg.getSid());
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("messageId", msg.getSid());
            return res;
        } catch (Exception e) {
            log.error("❌ WhatsApp error: {}", e.getMessage());
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", false);
            res.put("error", e.getMessage());
            return res;
        }
    }

    public Map<String, Object> sendNotification(String to, String message, String preference) {
        if (preference == null) preference = "sms";
        Map<String, Object> results = new LinkedHashMap<>();

        if ("sms".equalsIgnoreCase(preference) || "both".equalsIgnoreCase(preference)) {
            results.put("sms", sendSMS(to, message));
        }

        if ("whatsapp".equalsIgnoreCase(preference) || "both".equalsIgnoreCase(preference)) {
            results.put("whatsapp", sendWhatsApp(to, message));
        }

        return results;
    }

    public Map<String, Object> notifyTableReady(String guestName, String phoneNumber, String tableNumber, String preference) {
        String message = (tableNumber != null && !tableNumber.isBlank())
                ? String.format("Hi %s! Your table #%s is ready at DineFlow. Please proceed to the host stand.", guestName, tableNumber)
                : String.format("Hi %s! Your table is ready at DineFlow. Please proceed to the host stand.", guestName);
        return sendNotification(phoneNumber, message, preference);
    }

    public Map<String, Object> sendWaitlistConfirmation(String guestName, String phoneNumber, int partySize, int estimatedWait, String preference) {
        String message = String.format("Hi %s! You've been added to the waitlist for %d guests. Estimated wait: ~%d minutes. We'll notify you when your table is ready.",
                guestName, partySize, estimatedWait);
        return sendNotification(phoneNumber, message, preference);
    }

    public Map<String, Object> sendPositionUpdate(String guestName, String phoneNumber, int position, int estimatedWait, String preference) {
        String message = String.format("Hi %s! Update: You're now #%d in line. Estimated wait: ~%d minutes.",
                guestName, position, estimatedWait);
        return sendNotification(phoneNumber, message, preference);
    }
}
