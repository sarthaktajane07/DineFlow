# Twilio SMS & WhatsApp Integration Guide

This guide explains how to set up and use SMS and WhatsApp notifications in DineFlow Pro using Twilio.

## 📋 Prerequisites

Before you start, you'll need:
1. A Twilio account (sign up at https://www.twilio.com)
2. A Twilio phone number for SMS
3. (Optional) A WhatsApp-enabled Twilio number for WhatsApp messages

## 🔧 Setup Instructions

### 1. Get Twilio Credentials

1. Log in to your [Twilio Console](https://console.twilio.com)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Get a phone number:
   - Go to **Phone Numbers** → **Manage** → **Buy a number**
   - Choose a number with SMS capabilities
   - For WhatsApp, go to **Messaging** → **Try it out** → **Send a WhatsApp message**

### 2. Configure Environment Variables

Update your `.env` file with your Twilio credentials:

```env
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_PHONE_NUMBER=+1234567890
VITE_TWILIO_WHATSAPP_NUMBER=+1234567890
```

**Important:** 
- Phone numbers must be in E.164 format (e.g., +1234567890)
- Never commit your `.env` file to version control
- For production, use Twilio Functions or a backend server

### 3. Restart Development Server

After updating environment variables:

```bash
npm run dev
```

## 📱 Usage Examples

### Using the React Hook

The easiest way to send notifications is using the `useNotifications` hook:

```tsx
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationType } from '@/integrations/twilio';

function WaitlistManager() {
  const { sendTableReady, sendWaitlistAdded, isSending, lastError } = useNotifications();

  const handleTableReady = async () => {
    const response = await sendTableReady(
      'John Doe',           // Guest name
      '+1234567890',        // Phone number
      '12',                 // Table number
      NotificationType.SMS, // SMS or WhatsApp
      'DineFlow Restaurant' // Optional: Restaurant name
    );

    if (response.success) {
      console.log('Notification sent!', response.messageId);
    } else {
      console.error('Failed:', response.error);
    }
  };

  const handleWaitlistAdded = async () => {
    await sendWaitlistAdded(
      'Jane Smith',           // Guest name
      '+1234567890',          // Phone number
      4,                      // Party size
      25,                     // Estimated wait (minutes)
      NotificationType.WHATSAPP // Send via WhatsApp
    );
  };

  return (
    <div>
      <button onClick={handleTableReady} disabled={isSending}>
        Notify Guest - Table Ready
      </button>
      {lastError && <p>Error: {lastError}</p>}
    </div>
  );
}
```

### Using Service Functions Directly

You can also import and use the service functions directly:

```tsx
import { 
  sendTableReadyNotification,
  sendWaitlistConfirmation,
  sendWaitlistUpdate,
  NotificationType 
} from '@/integrations/twilio';

// Send table ready notification
const result = await sendTableReadyNotification(
  'John Doe',
  '+1234567890',
  '15',
  NotificationType.SMS
);

// Send waitlist confirmation
await sendWaitlistConfirmation(
  'Jane Smith',
  '+1234567890',
  4,
  20,
  NotificationType.WHATSAPP
);

// Send waitlist position update
await sendWaitlistUpdate(
  'Bob Johnson',
  '+1234567890',
  3,
  15,
  NotificationType.SMS
);
```

## 📨 Notification Types

### SMS Notifications
Standard text messages sent to mobile phones.

```tsx
NotificationType.SMS
```

### WhatsApp Notifications
Messages sent via WhatsApp (requires WhatsApp-enabled Twilio number).

```tsx
NotificationType.WHATSAPP
```

## 💬 Message Templates

The system includes pre-configured message templates:

### Table Ready
- **SMS:** "Hi {name}! Your table #{number} is ready at {restaurant}. Please proceed to the host stand."
- **WhatsApp:** Includes emojis and formatted layout

### Waitlist Confirmation
- **SMS:** "Hi {name}! You've been added to the waitlist for {size} guests. Estimated wait: ~{time} minutes..."
- **WhatsApp:** Includes emojis and formatted layout

### Waitlist Update
- **SMS:** "Hi {name}! Update: You're now #{position} in line. Estimated wait: ~{time} minutes."
- **WhatsApp:** Includes emojis and formatted layout

## 🔒 Security Best Practices

### For Development
The current implementation works for testing, but exposes credentials in the browser.

### For Production
**IMPORTANT:** Move Twilio API calls to a backend server or serverless function:

1. **Option 1: Backend API**
   ```typescript
   // Create an API endpoint on your backend
   POST /api/notifications/send
   {
     "to": "+1234567890",
     "type": "sms",
     "message": "Your table is ready!"
   }
   ```

2. **Option 2: Twilio Functions**
   - Use [Twilio Functions](https://www.twilio.com/docs/runtime/functions) (serverless)
   - Keep credentials secure on Twilio's servers
   - Call from frontend using HTTP requests

3. **Option 3: Supabase Edge Functions**
   - Create an edge function in your Supabase project
   - Store Twilio credentials as Supabase secrets
   - Call the function from your frontend

### Example: Supabase Edge Function

```typescript
// supabase/functions/send-notification/index.ts
import { Twilio } from 'https://esm.sh/twilio@4.19.0'

Deno.serve(async (req) => {
  const { to, message, type } = await req.json()
  
  const client = new Twilio(
    Deno.env.get('TWILIO_ACCOUNT_SID'),
    Deno.env.get('TWILIO_AUTH_TOKEN')
  )
  
  const result = await client.messages.create({
    to: type === 'whatsapp' ? `whatsapp:${to}` : to,
    from: Deno.env.get('TWILIO_PHONE_NUMBER'),
    body: message
  })
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## 🧪 Testing

### Test with Twilio's Verified Numbers

During development, you can only send messages to verified phone numbers:

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Phone Numbers** → **Manage** → **Verified Caller IDs**
3. Click **+ Add a new Caller ID**
4. Enter your phone number and complete verification

### WhatsApp Testing

For WhatsApp:
1. Send "join [your-sandbox-code]" to Twilio's WhatsApp number
2. The sandbox code is shown in your Twilio Console under **Messaging** → **Try it out**
3. You can now receive test WhatsApp messages

## 📊 Error Handling

The integration includes comprehensive error handling:

```tsx
const { sendTableReady, lastError, lastSuccess } = useNotifications();

const handleNotify = async () => {
  const result = await sendTableReady('John', '+1234567890', '5');
  
  if (result.success) {
    // Show success message
    toast.success('Guest notified successfully!');
  } else {
    // Show error message
    toast.error(result.error || 'Failed to send notification');
  }
};
```

## 🌍 International Phone Numbers

The system automatically formats phone numbers to E.164 format:

- US numbers: `1234567890` → `+11234567890`
- Already formatted: `+44123456789` (keeps as is)
- Numbers starting with country code: `44123456789` → `+44123456789`

## 💰 Pricing

See [Twilio Pricing](https://www.twilio.com/pricing) for current rates:
- SMS: ~$0.0079 per message (US)
- WhatsApp: ~$0.005 per conversation

## 📚 Additional Resources

- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio WhatsApp Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)

## 🆘 Troubleshooting

### "Twilio credentials not configured"
- Check that `.env` file has correct values
- Restart the dev server after updating `.env`

### "Failed to send notification"
- Verify your Twilio credentials
- Check phone number format (must be E.164)
- Ensure `to` number is verified in development mode
- Check Twilio Console for error logs

### WhatsApp not working
- Ensure your Twilio number is WhatsApp-enabled
- Test recipient must have joined your WhatsApp sandbox
- Check WhatsApp message template compliance

---

Need help? Check the [Twilio Support](https://support.twilio.com) or consult the documentation.
