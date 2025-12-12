import mongoose from 'mongoose';

const serviceHistorySchema = new mongoose.Schema(
    {
        table: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: true,
        },
        waitlistEntry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WaitlistEntry',
            required: true,
        },
        waiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        guestName: {
            type: String,
            required: true,
        },
        partySize: {
            type: Number,
            required: true,
        },
        seatedAt: {
            type: Date,
            required: true,
        },
        leftAt: {
            type: Date,
            default: null,
        },
        serviceDuration: {
            type: Number, // in minutes
            default: null,
        },
        waitTime: {
            type: Number, // in minutes
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        dayOfWeek: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        shift: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'late-night'],
        },
        revenue: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },
        notes: {
            type: String,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for analytics queries
serviceHistorySchema.index({ table: 1, date: -1 });
serviceHistorySchema.index({ waiter: 1, date: -1 });
serviceHistorySchema.index({ date: -1 });
serviceHistorySchema.index({ shift: 1, dayOfWeek: 1 });

// Calculate service duration before saving
serviceHistorySchema.pre('save', function (next) {
    if (this.leftAt && this.seatedAt && !this.serviceDuration) {
        this.serviceDuration = Math.floor((this.leftAt - this.seatedAt) / 60000);
    }

    // Set day of week
    if (!this.dayOfWeek) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.dayOfWeek = days[this.date.getDay()];
    }

    // Set shift based on time
    if (!this.shift) {
        const hour = this.date.getHours();
        if (hour >= 6 && hour < 11) this.shift = 'breakfast';
        else if (hour >= 11 && hour < 16) this.shift = 'lunch';
        else if (hour >= 16 && hour < 22) this.shift = 'dinner';
        else this.shift = 'late-night';
    }

    next();
});

// Static method for analytics
serviceHistorySchema.statics.getAverageServiceTime = async function (tableId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.aggregate([
        {
            $match: {
                table: tableId,
                date: { $gte: startDate },
                serviceDuration: { $ne: null },
            },
        },
        {
            $group: {
                _id: null,
                avgDuration: { $avg: '$serviceDuration' },
                avgWaitTime: { $avg: '$waitTime' },
                totalGuests: { $sum: '$partySize' },
                totalRevenue: { $sum: '$revenue' },
            },
        },
    ]);

    return result[0] || null;
};

// Static method for waiter performance
serviceHistorySchema.statics.getWaiterPerformance = async function (waiterId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.aggregate([
        {
            $match: {
                waiter: waiterId,
                date: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: null,
                totalTables: { $sum: 1 },
                avgServiceTime: { $avg: '$serviceDuration' },
                totalRevenue: { $sum: '$revenue' },
                avgRating: { $avg: '$rating' },
                totalGuests: { $sum: '$partySize' },
            },
        },
    ]);

    return result[0] || null;
};

const ServiceHistory = mongoose.model('ServiceHistory', serviceHistorySchema);

export default ServiceHistory;
