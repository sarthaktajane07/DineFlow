import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bell, Clock, Phone, Trash2, UserPlus, Users, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function WaitlistPanel({ waitlist, onAddGuest, onNotify, onRemove, className }) {
  const [showForm, setShowForm] = useState(false);

  // Add Guest Form State
  const [name, setName] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [notificationPreference, setNotificationPreference] = useState('sms');
  const [loading, setLoading] = useState(false);

  // Notify Dialog State
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [notifyMethod, setNotifyMethod] = useState('sms');
  const [tableNumber, setTableNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const success = await onAddGuest(name, parseInt(partySize), phone || undefined, notes || undefined, notificationPreference);
    setLoading(false);
    if (success) {
      setName('');
      setPartySize('2');
      setPhone('');
      setNotes('');
      setNotificationPreference('sms');
      setShowForm(false);
    }
  };

  const openNotifyDialog = (entry) => {
    setSelectedGuestId(entry.id);
    setNotifyMethod(entry.notification_preference || 'sms');
    setTableNumber('');
    setNotifyDialogOpen(true);
  };

  const handleNotifyConfirm = async () => {
    if (selectedGuestId) {
      // Call the onNotify prop with id, method, and table number
      await onNotify(selectedGuestId, notifyMethod, tableNumber);
      setNotifyDialogOpen(false);
      setSelectedGuestId(null);
    }
  };

  return (
    <>
      <Card className={cn('shadow-card', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="font-display text-xl">Waitlist</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add Guest
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Guest Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partySize">Party Size</Label>
                  <Input id="partySize" type="number" min="1" max="20" value={partySize} onChange={(e) => setPartySize(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
              </div>

              <div className="space-y-2">
                <Label>Notification Preference</Label>
                <RadioGroup value={notificationPreference} onValueChange={setNotificationPreference} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms" />
                    <Label htmlFor="sms" className="flex items-center gap-1 cursor-pointer">
                      <Phone className="w-3 h-3" /> SMS
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <Label htmlFor="whatsapp" className="flex items-center gap-1 cursor-pointer">
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Adding...' : 'Add to Waitlist'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {waitlist.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No guests waiting</p>
              </div>
            ) : (
              waitlist.map((entry, index) => (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border border-border bg-card',
                    'transition-all hover:shadow-md',
                    entry.notified_at && 'border-primary/50 bg-primary/5'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {entry.guest_name}
                        {entry.notification_preference === 'whatsapp' && (
                          <MessageSquare className="w-3 h-3 text-green-600" title="WhatsApp" />
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {entry.party_size}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(() => {
                            try {
                              return entry.created_at ? formatDistanceToNow(new Date(entry.created_at), { addSuffix: true }) : 'Just now';
                            } catch (e) {
                              return 'Just now';
                            }
                          })()}
                        </span>
                        {entry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {entry.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.notified_at ? (
                      <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">
                        Notified
                      </span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => openNotifyDialog(entry)} className="gap-1">
                        <Bell className="w-3 h-3" />
                        Notify
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notify Guest</DialogTitle>
            <DialogDescription>
              Choose how you want to notify this guest.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Notification Method</Label>
              <RadioGroup value={notifyMethod} onValueChange={setNotifyMethod} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="notify-sms" />
                  <Label htmlFor="notify-sms" className="flex items-center gap-1 cursor-pointer">
                    <Phone className="w-3 h-3" /> SMS
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="notify-whatsapp" />
                  <Label htmlFor="notify-whatsapp" className="flex items-center gap-1 cursor-pointer">
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableNumber">Table Number (Optional)</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleNotifyConfirm}>Send Notification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
