// Twilio Configuration
export const TWILIO_CONFIG = {
    accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
    authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
    phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
    whatsappNumber: import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER || '',
};
// Notification types
export var NotificationType;
(function (NotificationType) {
    NotificationType["SMS"] = "sms";
    NotificationType["WHATSAPP"] = "whatsapp";
})(NotificationType || (NotificationType = {}));
// Notification templates
export const NOTIFICATION_TEMPLATES = {
    TABLE_READY: {
        sms: (guestName, tableNumber, restaurantName = 'DineFlow') => `Hi ${guestName}! Your table #${tableNumber} is ready at ${restaurantName}. Please proceed to the host stand.`,
        whatsapp: (guestName, tableNumber, restaurantName = 'DineFlow') => `🍽️ Hi ${guestName}!\n\nYour table #${tableNumber} is ready at ${restaurantName}.\n\nPlease proceed to the host stand. Thank you for your patience!`,
    },
    WAITLIST_CONFIRMATION: {
        sms: (guestName, partySize, estimatedWait) => `Hi ${guestName}! You've been added to the waitlist for ${partySize} guests. Estimated wait: ~${estimatedWait} minutes. We'll notify you when your table is ready.`,
        whatsapp: (guestName, partySize, estimatedWait) => `✅ Hi ${guestName}!\n\nYou've been added to our waitlist:\n👥 Party size: ${partySize}\n⏰ Estimated wait: ~${estimatedWait} minutes\n\nWe'll send you a notification when your table is ready!`,
    },
    WAITLIST_UPDATE: {
        sms: (guestName, position, estimatedWait) => `Hi ${guestName}! Update: You're now #${position} in line. Estimated wait: ~${estimatedWait} minutes.`,
        whatsapp: (guestName, position, estimatedWait) => `📍 Hi ${guestName}!\n\nWaitlist Update:\n🔢 Position: #${position}\n⏰ Estimated wait: ~${estimatedWait} minutes\n\nWe appreciate your patience!`,
    },
};
