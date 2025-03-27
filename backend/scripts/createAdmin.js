const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mkura', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@mkura.com' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            name: 'Admin User',
            email: 'admin@mkura.com',
            password: 'admin123456',
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin(); 