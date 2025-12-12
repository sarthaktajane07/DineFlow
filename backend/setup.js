import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Table from './src/models/Table.js';

dotenv.config();

const setupDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Table.deleteMany({});

        // Create default users
        console.log('👥 Creating default users...');

        const adminUser = await User.create({
            fullName: 'Admin User',
            email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@dineflow.com',
            password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
            role: 'manager',
            isActive: true,
        });

        const hostUser = await User.create({
            fullName: 'Host User',
            email: 'host@dineflow.com',
            password: 'host123',
            role: 'host',
            isActive: true,
            createdBy: adminUser._id,
        });

        const staffUser = await User.create({
            fullName: 'Staff User',
            email: 'staff@dineflow.com',
            password: 'staff123',
            role: 'staff',
            isActive: true,
            createdBy: adminUser._id,
        });

        console.log('✅ Users created successfully!');
        console.log(`   Manager: ${adminUser.email} / ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
        console.log(`   Host: ${hostUser.email} / host123`);
        console.log(`   Staff: ${staffUser.email} / staff123`);

        // Create sample tables
        console.log('\n📋 Creating sample tables...');

        const tables = [
            { tableNumber: '1', seats: 2, zone: 'indoor', position: { x: 100, y: 100 }, shape: 'square' },
            { tableNumber: '2', seats: 2, zone: 'indoor', position: { x: 200, y: 100 }, shape: 'square' },
            { tableNumber: '3', seats: 4, zone: 'indoor', position: { x: 300, y: 100 }, shape: 'square' },
            { tableNumber: '4', seats: 4, zone: 'indoor', position: { x: 100, y: 200 }, shape: 'round' },
            { tableNumber: '5', seats: 6, zone: 'indoor', position: { x: 200, y: 200 }, shape: 'rectangle' },
            { tableNumber: '6', seats: 4, zone: 'outdoor', position: { x: 300, y: 200 }, shape: 'square' },
            { tableNumber: '7', seats: 2, zone: 'bar', position: { x: 100, y: 300 }, shape: 'square' },
            { tableNumber: '8', seats: 8, zone: 'vip', position: { x: 200, y: 300 }, shape: 'rectangle' },
        ];

        await Table.insertMany(tables);
        console.log('✅ Tables created successfully!');
        console.log(`   Created ${tables.length} tables`);

        console.log('\n✅ Database setup complete!');
        console.log('\n📖 You can now start the server with: npm run dev');
        console.log('\n🔐 Login credentials:');
        console.log('   Manager: admin@dineflow.com / admin123');
        console.log('   Host: host@dineflow.com / host123');
        console.log('   Staff: staff@dineflow.com / staff123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    }
};

setupDatabase();
