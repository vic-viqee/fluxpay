import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fluxpay';

const adminUser = {
  username: 'admin',
  email: 'admin@fluxpay.com',
  password: 'FluxPay2024!',
  businessName: 'FluxPay',
  businessType: 'Technology',
  businessPhoneNumber: '254700000000',
  preferredPaymentMethod: 'M-Pesa STK Push',
  role: 'admin',
  plan: 'Enterprise'
};

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = (await import('./src/models/User')).default;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', existingAdmin.email);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);

    // Create admin user
    const admin = new User({
      ...adminUser,
      password: hashedPassword
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminUser.password);
    console.log('🔐 Role: admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Login at: https://fluxpay-frontend.onrender.com/login');
    console.log('Then visit: /admin for the admin dashboard');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();