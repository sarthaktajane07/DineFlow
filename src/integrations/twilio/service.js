import { TWILIO_CONFIG, NotificationType, NOTIFICATION_TEMPLATES } from './config';
/**
 * Sends SMS or WhatsApp notification using Twilio
 * Note: This is a client-side implementation. For production, move to backend/serverless function
 */
export const sendNotification = async ({ to, guestName, type, messageType, data, }) => {
    try {
        // Validate Twilio configuration
        if (!TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken) {
            throw new Error('Twilio credentials not configured. Please set VITE_TWILIO_ACCOUNT_SID and VITE_TWILIO_AUTH_TOKEN in .env');
        }
        // Format phone number
        const toNumber = formatPhoneNumber(to);
        // Get the from number based on notification type
        const fromNumber = type === NotificationType.WHATSAPP
            ? `whatsapp:${TWILIO_CONFIG.whatsappNumber}`
            : TWILIO_CONFIG.phoneNumber;
        if (!fromNumber || fromNumber === 'whatsapp:' || fromNumber === '') {
            throw new Error(`Twilio ${type} number not configured`);
        }
        // Generate message content
        const message = generateMessage(messageType, type, guestName, data);
        // Format recipient number for WhatsApp
        const recipient = type === NotificationType.WHATSAPP
            ? `whatsapp:${toNumber}`
            : toNumber;
        // For production, this should be a backend API call
        // Here's the structure for reference:
        const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`;
        const response = await fetch(twilioApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
            },
            body: new URLSearchParams({
                To: recipient,
                From: fromNumber,
                Body: message,
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send notification');
        }
        const result = await response.json();
        return {
            success: true,
            messageId: result.sid,
        };
    }
    catch (error) {
        console.error('Notification error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
};
/**
 * Format phone number to E.164 format
 */
const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Add +1 for US numbers if not present
    if (cleaned.length === 10) {
        return `+1${cleaned}`;
    }
    // If already has country code
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+${cleaned}`;
    }
    // If it already starts with +
    if (phone.startsWith('+')) {
        return phone.replace(/\D/g, '').replace(/^/, '+');
    }
    return `+${cleaned}`;
};
/**
 * Generate message based on template
 */
const generateMessage = (messageType, notificationType, guestName, data) => {
    const template = NOTIFICATION_TEMPLATES[messageType];
    switch (messageType) {
        case 'TABLE_READY':
            return notificationType === NotificationType.WHATSAPP
                ? template.whatsapp(guestName, data.tableNumber || 'N/A', data.restaurantName)
                : template.sms(guestName, data.tableNumber || 'N/A', data.restaurantName);
        case 'WAITLIST_CONFIRMATION':
            return notificationType === NotificationType.WHATSAPP
                ? template.whatsapp(guestName, data.partySize || 0, data.estimatedWait || 0)
                : template.sms(guestName, data.partySize || 0, data.estimatedWait || 0);
        case 'WAITLIST_UPDATE':
            return notificationType === NotificationType.WHATSAPP
                ? template.whatsapp(guestName, data.position || 0, data.estimatedWait || 0)
                : template.sms(guestName, data.position || 0, data.estimatedWait || 0);
        default:
            return `Hi ${guestName}, this is a notification from DineFlow.`;
    }
};
/**
 * Send table ready notification
 */
export const sendTableReadyNotification = async (guestName, phoneNumber, tableNumber, type = NotificationType.SMS, restaurantName) => {
    return sendNotification({
        to: phoneNumber,
        guestName,
        type,
        messageType: 'TABLE_READY',
        data: { tableNumber, restaurantName },
    });
};
/**
 * Send waitlist confirmation notification
 */
export const sendWaitlistConfirmation = async (guestName, phoneNumber, partySize, estimatedWait, type = NotificationType.SMS) => {
    return sendNotification({
        to: phoneNumber,
        guestName,
        type,
        messageType: 'WAITLIST_CONFIRMATION',
        data: { partySize, estimatedWait },
    });
};
/**
 * Send waitlist position update notification
 */
export const sendWaitlistUpdate = async (guestName, phoneNumber, position, estimatedWait, type = NotificationType.SMS) => {
    return sendNotification({
        to: phoneNumber,
        guestName,
        type,
        messageType: 'WAITLIST_UPDATE',
        data: { position, estimatedWait },
    });
};
