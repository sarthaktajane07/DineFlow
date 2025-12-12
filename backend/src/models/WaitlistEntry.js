import mongoose from 'mongoose';

const waitlistEntrySchema = new mongoose.Schema(
    {
        guestName: {
            type: String,
            required: [true, 'Guest name is required'],
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            match: [/^\+?[\d\s\-()]+$/, 'Please provide a valid phone number'],
        },
        partySize: {
            type: Number,
            required: [true, 'Party size is required'],
            min: [1, 'Party size must be at least 1'],
            max: [20, 'Party size cannot exceed 20'],
        },
        status: {
            type: String,
            enum: ['waiting', 'notified', 'seated', 'cancelled', 'no-show'],
            default: 'waiting',
        },
        priority: {
            type: String,
            enum: ['normal', 'vip', 'reservation'],
            default: 'normal',
        },
        estimatedWaitTime: {
            type: Number, // in minutes
            default: 0,
        },
        notificationPreference: {
            type: String,
            enum: ['sms', 'whatsapp', 'both'],
            default: 'sms',
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        assignedTable: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            default: null,
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        notifiedAt: {
            type: Date,
            default: null,
        },
        seatedAt: {
            type: Date,
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
        actualWaitTime: {
            type: Number, // in minutes, calculated when seated
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
waitlistEntrySchema.index({ status: 1, createdAt: 1 });
waitlistEntrySchema.index({ phoneNumber: 1 });

// Calculate actual wait time before saving if status changes to 'seated'
waitlistEntrySchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'seated' && !this.actualWaitTime) {
        const waitTime = Math.floor((Date.now() - this.createdAt) / 60000); // Convert to minutes
        this.actualWaitTime = waitTime;
        this.seatedAt = new Date();
    }
    next();
});

// Virtual for wait time in minutes
waitlistEntrySchema.virtual('currentWaitTime').get(function () {
    if (this.status === 'seated' && this.actualWaitTime) {
        return this.actualWaitTime;
    }
    return Math.floor((Date.now() - this.createdAt) / 60000);
});

// Method to get position in queue
waitlistEntrySchema.methods.getQueuePosition = async function () {
    const count = await this.constructor.countDocuments({
        status: 'waiting',
        createdAt: { $lt: this.createdAt },
    });
    return count + 1;
};

const WaitlistEntry = mongoose.model('WaitlistEntry', waitlistEntrySchema);

export default WaitlistEntry;
