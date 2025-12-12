import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationDialog } from '@/components/notifications/NotificationDialog';
import { Bell } from 'lucide-react';
/**
 * Example component showing how to integrate notifications into your waitlist/table management
 */
export function NotificationExamples() {
    const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
    const [notificationConfig, setNotificationConfig] = useState(null);
    // Example: Notify when table is ready
    const handleTableReady = (assignment) => {
        setNotificationConfig({
            type: 'table_ready',
            guestName: assignment.guestName,
            phoneNumber: assignment.phoneNumber,
            tableNumber: assignment.tableNumber,
        });
        setNotifyDialogOpen(true);
    };
    // Example: Send waitlist confirmation
    const handleWaitlistAdded = (entry) => {
        setNotificationConfig({
            type: 'waitlist_confirmation',
            guestName: entry.guestName,
            phoneNumber: entry.phoneNumber,
            partySize: entry.partySize,
            estimatedWait: entry.estimatedWait,
        });
        setNotifyDialogOpen(true);
    };
    // Example: Send position update
    const handlePositionUpdate = (entry) => {
        setNotificationConfig({
            type: 'waitlist_update',
            guestName: entry.guestName,
            phoneNumber: entry.phoneNumber,
            position: entry.position,
            estimatedWait: entry.estimatedWait,
        });
        setNotifyDialogOpen(true);
    };
    return (<div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Notification Examples</h2>

            {/* Example 1: Table Ready Button */}
            <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">Table Ready Notification</h3>
                <p className="text-sm text-muted-foreground">
                    Notify a guest when their table is ready
                </p>
                <Button onClick={() => handleTableReady({
            guestName: 'John Doe',
            phoneNumber: '+1234567890',
            tableNumber: '12',
        })}>
                    <Bell className="mr-2 h-4 w-4"/>
                    Notify Guest - Table #12 Ready
                </Button>
            </div>

            {/* Example 2: Waitlist Confirmation */}
            <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">Waitlist Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                    Send confirmation when guest is added to waitlist
                </p>
                <Button onClick={() => handleWaitlistAdded({
            id: '1',
            guestName: 'Jane Smith',
            phoneNumber: '+1234567890',
            partySize: 4,
            estimatedWait: 25,
            position: 3,
        })}>
                    <Bell className="mr-2 h-4 w-4"/>
                    Send Waitlist Confirmation
                </Button>
            </div>

            {/* Example 3: Position Update */}
            <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">Waitlist Position Update</h3>
                <p className="text-sm text-muted-foreground">
                    Update guest about their position in the waitlist
                </p>
                <Button onClick={() => handlePositionUpdate({
            id: '2',
            guestName: 'Bob Johnson',
            phoneNumber: '+1234567890',
            partySize: 2,
            estimatedWait: 15,
            position: 2,
        })}>
                    <Bell className="mr-2 h-4 w-4"/>
                    Send Position Update
                </Button>
            </div>

            {/* Notification Dialog */}
            {notificationConfig && (<NotificationDialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen} notificationType={notificationConfig.type} guestName={notificationConfig.guestName} phoneNumber={notificationConfig.phoneNumber} tableNumber={notificationConfig.tableNumber} partySize={notificationConfig.partySize} estimatedWait={notificationConfig.estimatedWait} position={notificationConfig.position} restaurantName="DineFlow Restaurant"/>)}
        </div>);
}
/**
 * INTEGRATION GUIDE:
 *
 * To integrate notifications into your existing components:
 *
 * 1. Import the NotificationDialog and useState:
 *    import { NotificationDialog } from '@/components/notifications/NotificationDialog';
 *    import { useState } from 'react';
 *
 * 2. Add state for the dialog:
 *    const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
 *
 * 3. Add a button to trigger notifications:
 *    <Button onClick={() => setNotifyDialogOpen(true)}>
 *      Notify Guest
 *    </Button>
 *
 * 4. Add the dialog component:
 *    <NotificationDialog
 *      open={notifyDialogOpen}
 *      onOpenChange={setNotifyDialogOpen}
 *      notificationType="table_ready"
 *      guestName="John Doe"
 *      phoneNumber="+1234567890"
 *      tableNumber="12"
 *    />
 *
 * That's it! The dialog handles all notification logic.
 */
