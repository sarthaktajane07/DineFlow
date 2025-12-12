import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationType } from '@/integrations/twilio';
import { MessageSquare, MessageCircle, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
export function NotificationDialog({ open, onOpenChange, guestName, phoneNumber, tableNumber, partySize, estimatedWait, notificationType, position, restaurantName = 'DineFlow', }) {
    const [selectedType, setSelectedType] = useState(NotificationType.SMS);
    const { sendTableReady, sendWaitlistAdded, sendWaitlistPositionUpdate, isSending } = useNotifications();
    const { toast } = useToast();
    const handleSendNotification = async () => {
        let result;
        try {
            switch (notificationType) {
                case 'table_ready':
                    if (!tableNumber) {
                        toast({
                            title: 'Error',
                            description: 'Table number is required',
                            variant: 'destructive',
                        });
                        return;
                    }
                    result = await sendTableReady(guestName, phoneNumber, tableNumber, selectedType, restaurantName);
                    break;
                case 'waitlist_confirmation':
                    if (!partySize || !estimatedWait) {
                        toast({
                            title: 'Error',
                            description: 'Party size and estimated wait are required',
                            variant: 'destructive',
                        });
                        return;
                    }
                    result = await sendWaitlistAdded(guestName, phoneNumber, partySize, estimatedWait, selectedType);
                    break;
                case 'waitlist_update':
                    if (position === undefined || !estimatedWait) {
                        toast({
                            title: 'Error',
                            description: 'Position and estimated wait are required',
                            variant: 'destructive',
                        });
                        return;
                    }
                    result = await sendWaitlistPositionUpdate(guestName, phoneNumber, position, estimatedWait, selectedType);
                    break;
                default:
                    toast({
                        title: 'Error',
                        description: 'Invalid notification type',
                        variant: 'destructive',
                    });
                    return;
            }
            if (result.success) {
                toast({
                    title: 'Notification Sent! 🎉',
                    description: `${selectedType === NotificationType.WHATSAPP ? 'WhatsApp' : 'SMS'} sent to ${guestName}`,
                });
                onOpenChange(false);
            }
            else {
                toast({
                    title: 'Failed to Send',
                    description: result.error || 'An unknown error occurred',
                    variant: 'destructive',
                });
            }
        }
        catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to send notification',
                variant: 'destructive',
            });
        }
    };
    const getDialogTitle = () => {
        switch (notificationType) {
            case 'table_ready':
                return 'Notify Guest - Table Ready';
            case 'waitlist_confirmation':
                return 'Send Waitlist Confirmation';
            case 'waitlist_update':
                return 'Send Waitlist Update';
            default:
                return 'Send Notification';
        }
    };
    const getDialogDescription = () => {
        switch (notificationType) {
            case 'table_ready':
                return `Send a notification to ${guestName} that table #${tableNumber} is ready.`;
            case 'waitlist_confirmation':
                return `Confirm ${guestName}'s spot on the waitlist for ${partySize} guests.`;
            case 'waitlist_update':
                return `Update ${guestName} about their waitlist position (#${position}).`;
            default:
                return 'Choose how to notify the guest.';
        }
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                    <DialogDescription>{getDialogDescription()}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Guest Information</Label>
                        <div className="rounded-lg border p-3 space-y-1">
                            <p className="font-medium">{guestName}</p>
                            <p className="text-sm text-muted-foreground">{phoneNumber}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Notification Method</Label>
                        <RadioGroup value={selectedType} onValueChange={(v) => setSelectedType(v)}>
                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer">
                                <RadioGroupItem value={NotificationType.SMS} id="sms"/>
                                <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer flex-1">
                                    <MessageSquare className="h-4 w-4"/>
                                    <div className="flex-1">
                                        <p className="font-medium">SMS</p>
                                        <p className="text-xs text-muted-foreground">Send via text message</p>
                                    </div>
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer">
                                <RadioGroupItem value={NotificationType.WHATSAPP} id="whatsapp"/>
                                <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer flex-1">
                                    <MessageCircle className="h-4 w-4"/>
                                    <div className="flex-1">
                                        <p className="font-medium">WhatsApp</p>
                                        <p className="text-xs text-muted-foreground">Send via WhatsApp</p>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSendNotification} disabled={isSending}>
                        {isSending ? (<>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Sending...
                            </>) : (<>
                                <Send className="mr-2 h-4 w-4"/>
                                Send Notification
                            </>)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>);
}
