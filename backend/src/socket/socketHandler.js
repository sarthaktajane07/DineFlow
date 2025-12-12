import { verifyToken } from '../utils/jwt.js';

class SocketHandler {
    constructor() {
        this.io = null;
        this.users = new Map(); // userId -> socketId
    }

    /**
     * Initialize Socket.IO
     */
    initialize(io) {
        this.io = io;

        io.on('connection', (socket) => {
            console.log(`✅ Socket connected: ${socket.id}`);

            // Handle authentication
            socket.on('authenticate', async (token) => {
                try {
                    const decoded = verifyToken(token);
                    socket.userId = decoded.id;
                    socket.userRole = decoded.role;
                    this.users.set(decoded.id, socket.id);

                    socket.emit('authenticated', { userId: decoded.id, role: decoded.role });
                    console.log(`✅ Socket authenticated: User ${decoded.id}, Role: ${decoded.role}`);
                } catch (error) {
                    socket.emit('authentication_error', { message: 'Invalid token' });
                }
            });

            // Join specific rooms
            socket.on('join_restaurant', (restaurantId) => {
                socket.join(`restaurant_${restaurantId}`);
                console.log(`User joined restaurant room: ${restaurantId}`);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                if (socket.userId) {
                    this.users.delete(socket.userId);
                }
                console.log(`❌ Socket disconnected: ${socket.id}`);
            });
        });
    }

    /**
     * Emit table update to all connected clients
     */
    emitTableUpdate(table) {
        if (!this.io) return;

        this.io.emit('table:updated', {
            table,
            timestamp: new Date(),
        });
    }

    /**
     * Emit new table created
     */
    emitTableCreated(table) {
        if (!this.io) return;

        this.io.emit('table:created', {
            table,
            timestamp: new Date(),
        });
    }

    /**
     * Emit table deleted
     */
    emitTableDeleted(tableId) {
        if (!this.io) return;

        this.io.emit('table:deleted', {
            tableId,
            timestamp: new Date(),
        });
    }

    /**
     * Emit waitlist update
     */
    emitWaitlistUpdate(entry) {
        if (!this.io) return;

        this.io.emit('waitlist:updated', {
            entry,
            timestamp: new Date(),
        });
    }

    /**
     * Emit new waitlist entry
     */
    emitWaitlistAdded(entry) {
        if (!this.io) return;

        this.io.emit('waitlist:added', {
            entry,
            timestamp: new Date(),
        });
    }

    /**
     * Emit waitlist entry removed
     */
    emitWaitlistRemoved(entryId) {
        if (!this.io) return;

        this.io.emit('waitlist:removed', {
            entryId,
            timestamp: new Date(),
        });
    }

    /**
     * Emit guest seated notification
     */
    emitGuestSeated(data) {
        if (!this.io) return;

        this.io.emit('guest:seated', {
            ...data,
            timestamp: new Date(),
        });
    }

    /**
     * Emit notification sent event
     */
    emitNotificationSent(data) {
        if (!this.io) return;

        this.io.emit('notification:sent', {
            ...data,
            timestamp: new Date(),
        });
    }

    /**
     * Emit activity log
     */
    emitActivity(activity) {
        if (!this.io) return;

        this.io.emit('activity:new', {
            activity,
            timestamp: new Date(),
        });
    }

    /**
     * Send message to specific user
     */
    sendToUser(userId, event, data) {
        if (!this.io) return;

        const socketId = this.users.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }

    /**
     * Broadcast to specific role
     */
    broadcastToRole(role, event, data) {
        if (!this.io) return;

        this.io.emit(`${role}:${event}`, data);
    }
}

// Export singleton instance
export default new SocketHandler();
