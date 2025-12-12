import { useState } from 'react';
import { sendTableReadyNotification, sendWaitlistConfirmation, sendWaitlistUpdate, NotificationType, } from '@/integrations/twilio';
/**
 * Custom hook for sending notifications via SMS or WhatsApp
 */
export const useNotifications = () => {
    const [isSending, setIsSending] = useState(false);
    const [lastError, setLastError] = useState(null);
    const [lastSuccess, setLastSuccess] = useState(null);
    const sendTableReady = async (guestName, phoneNumber, tableNumber, type = NotificationType.SMS, restaurantName) => {
        setIsSending(true);
        setLastError(null);
        setLastSuccess(null);
        try {
            const response = await sendTableReadyNotification(guestName, phoneNumber, tableNumber, type, restaurantName);
            setLastSuccess(response.success);
            if (!response.success && response.error) {
                setLastError(response.error);
            }
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setLastError(errorMessage);
            setLastSuccess(false);
            return { success: false, error: errorMessage };
        }
        finally {
            setIsSending(false);
        }
    };
    const sendWaitlistAdded = async (guestName, phoneNumber, partySize, estimatedWait, type = NotificationType.SMS) => {
        setIsSending(true);
        setLastError(null);
        setLastSuccess(null);
        try {
            const response = await sendWaitlistConfirmation(guestName, phoneNumber, partySize, estimatedWait, type);
            setLastSuccess(response.success);
            if (!response.success && response.error) {
                setLastError(response.error);
            }
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setLastError(errorMessage);
            setLastSuccess(false);
            return { success: false, error: errorMessage };
        }
        finally {
            setIsSending(false);
        }
    };
    const sendWaitlistPositionUpdate = async (guestName, phoneNumber, position, estimatedWait, type = NotificationType.SMS) => {
        setIsSending(true);
        setLastError(null);
        setLastSuccess(null);
        try {
            const response = await sendWaitlistUpdate(guestName, phoneNumber, position, estimatedWait, type);
            setLastSuccess(response.success);
            if (!response.success && response.error) {
                setLastError(response.error);
            }
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setLastError(errorMessage);
            setLastSuccess(false);
            return { success: false, error: errorMessage };
        }
        finally {
            setIsSending(false);
        }
    };
    return {
        sendTableReady,
        sendWaitlistAdded,
        sendWaitlistPositionUpdate,
        isSending,
        lastError,
        lastSuccess,
    };
};
