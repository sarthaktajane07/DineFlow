import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
    {
        tableNumber: {
            type: String,
            required: [true, 'Table number is required'],
            unique: true,
            trim: true,
        },
        seats: {
            type: Number,
            required: [true, 'Number of seats is required'],
            min: [1, 'Table must have at least 1 seat'],
            max: [20, 'Table cannot have more than 20 seats'],
        },
        status: {
            type: String,
            enum: ['free', 'occupied', 'reserved', 'cleaning'],
            default: 'free',
            required: true,
        },
        zone: {
            type: String,
            default: 'main',
        },
        position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
        },
        shape: {
            type: String,
            enum: ['square', 'round', 'rectangle'],
            default: 'square',
        },
        currentGuest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WaitlistEntry',
            default: null,
        },
        assignedWaiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        occupiedAt: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
tableSchema.index({ status: 1, zone: 1 });

// Virtual for average service time
tableSchema.virtual('serviceHistory', {
    ref: 'ServiceHistory',
    localField: '_id',
    foreignField: 'table',
});

const Table = mongoose.model('Table', tableSchema);

export default Table;
