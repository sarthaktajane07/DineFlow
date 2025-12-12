import twilio from 'twilio';

class TwilioService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
        this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

        if (this.accountSid && this.authToken) {
            this.client = twilio(this.accountSid, this.authToken);
        } else {
            console.warn('⚠️ Twilio credentials not configured. SMS/WhatsApp notifications disabled.');
            this.client = null;
        }
    }

    /**
     * Check if Twilio is configured
     */
    isConfigured() {
        return this.client !== null;
    }

    /**
     * Send SMS notification
     */
    async sendSMS(to, message) {
        if (!this.isConfigured()) {
            console.log('📱 SMS (Mock):', { to, message });
            return { success: true, mock: true, messageId: 'mock_' + Date.now() };
        }

        try {
            const result = await this.client.messages.create({
                body: message,
                from: this.phoneNumber,
                to: to,
            });

            console.log('✅ SMS sent:', result.sid);
            return { success: true, messageId: result.sid };
        } catch (error) {
            console.error('❌ SMS error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send WhatsApp notification
     */
    async sendWhatsApp(to, message) {
        if (!this.isConfigured()) {
            console.log('💬 WhatsApp (Mock):', { to, message });
            return { success: true, mock: true, messageId: 'mock_' + Date.now() };
        }

        try {
            const result = await this.client.messages.create({
                body: message,
                from: `whatsapp:${this.whatsappNumber}`,
                to: `whatsapp:${to}`,
            });

            console.log('✅ WhatsApp sent:', result.sid);
            return { success: true, messageId: result.sid };
        } catch (error) {
            console.error('❌ WhatsApp error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send notification based on preference
     */
    async sendNotification(to, message, preference = 'sms') {
        const results = {};

        if (preference === 'sms' || preference === 'both') {
            results.sms = await this.sendSMS(to, message);
        }

        if (preference === 'whatsapp' || preference === 'both') {
            results.whatsapp = await this.sendWhatsApp(to, message);
        }

        return results;
    }

    /**
     * Send table ready notification
     */
    async notifyTableReady(guestName, phoneNumber, tableNumber, preference = 'sms') {
        const message = tableNumber
            ? `Hi ${guestName}! Your table #${tableNumber} is ready at DineFlow. Please proceed to the host stand.`
            : `Hi ${guestName}! Your table is ready at DineFlow. Please proceed to the host stand.`;
        return this.sendNotification(phoneNumber, message, preference);
    }

    /**
     * Send waitlist confirmation
     */
    async sendWaitlistConfirmation(guestName, phoneNumber, partySize, estimatedWait, preference = 'sms') {
        const message = `Hi ${guestName}! You've been added to the waitlist for ${partySize} guests. Estimated wait: ~${estimatedWait} minutes. We'll notify you when your table is ready.`;
        return this.sendNotification(phoneNumber, message, preference);
    }

    /**
     * Send position update
     */
    async sendPositionUpdate(guestName, phoneNumber, position, estimatedWait, preference = 'sms') {
        const message = `Hi ${guestName}! Update: You're now #${position} in line. Estimated wait: ~${estimatedWait} minutes.`;
        return this.sendNotification(phoneNumber, message, preference);
    }
}

// Export singleton instance
export default new TwilioService();
