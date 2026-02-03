import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, bio, techStack, socialLinks } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user (avatar uses Dicebear seed from name)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            bio: bio || '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            techStack: techStack || [],
            socialLinks: socialLinks || {}
        });

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        // Convert to object and remove password
        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: userObj
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and explicitly select password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        // Convert to object and remove password
        const userObj = user.toObject();
        delete userObj.password;

        res.json({
            message: 'Login successful',
            token,
            user: userObj
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
