import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

dotenv.config();

const genToken = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne();
        if (!user) {
            console.log('No user found');
            process.exit(0);
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        console.log('TOKEN:', token);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
genToken();
