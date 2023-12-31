const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtAdmin = require('jsonwebtoken');
require('dotenv').config();
const cors = require("cors");
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_STRING, {
    dbName: 'user-admin',
});
  
const db = mongoose.connection;
db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: function () { return !this.phone } },
    phone: { type: String, unique: true, required: function () { return !this.email } },
    name: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    isAdmin: { type: Boolean, default: false },
});

// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

// Define User model
const User = mongoose.model('User', userSchema);

// JWT Secret Key
const jwtSecretKey = process.env.JWT_SECRET_KEY || 'yourSecretKey';
const jwtSecretKeyAdmin = process.env.JWT_SECRET_KEY_ADMIN || 'yourSecretKeyAdmin';

// Middleware to authenticate JWT token for users
function authenticateToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    jwt.verify(token, jwtSecretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid token' });
        }

        req.user = user;
        next();
    });
}

// Middleware to authenticate JWT token for admins
function authenticateTokenAdmin(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    jwtAdmin.verify(token, jwtSecretKeyAdmin, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden: Invalid token' });
        }

        req.user = user;
        next();
    });
}

// User Registration
app.post('/user/register', async (req, res) => {
    try {
        const { email, phone, name, password, profileImage } = req.body;

        // Ensure at least one of email or phone is provided
        if (!email && !phone) {
            return res.status(400).json({ error: 'Provide at least one of email or phone' });
        }

        const user = new User({ email, phone, name, password, profileImage });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User Login with JWT
app.post('/user/login', async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        // Find user by email or phone
        const user = await User.findOne({ $or: [{ email }, { phone }] });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, jwtSecretKey, { expiresIn: '6h' });

        res.status(200).json({ message: 'Login successful', name: user.name, email: user.email, phone: user.phone, token});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Protected Route
app.get('/protected', authenticateToken, (req, res) => {
    try {
        res.status(200).json({ message: 'Protected route' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user
app.get('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.status(200).json({ userId: user._id, name: user.name, email: user.email, phone: user.phone, profileImage: user.profileImage });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user
app.put('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.name = req.body.name;
        user.profileImage = req.body.profileImage;
        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete user
app.delete('/user', authenticateToken, async (req, res) => {
    try {
        await User.deleteOne({ _id: req.user.userId });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Admin Registration
app.post('/admin/register', async (req, res) => {
    try {
        const { email, phone, name, password, profileImage } = req.body;

        // Ensure at least one of email or phone is provided
        if (!email && !phone) {
            return res.status(400).json({ error: 'Provide at least one of email or phone' });
        }

        const user = new User({ email, phone, name, password, profileImage, isAdmin: true });

        await user.save();
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Admin Login with JWT
app.post('/admin/login', async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        // Find user by email or phone
        const user = await User.findOne({ $or: [{ email }, { phone }], isAdmin: true });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwtAdmin.sign({ userId: user._id }, jwtSecretKeyAdmin, { expiresIn: '6h' });

        res.status(200).json({ message: 'Login successful', name: user.name, email: user.email, phone: user.phone, isAdmin: true, token});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all users
app.get('/allUsers', authenticateTokenAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user by admin
app.get('/user/:id', authenticateTokenAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json({ userId: user._id, name: user.name, email: user.email, phone: user.phone, profileImage: user.profileImage });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user by admin
app.put('/user/:id', authenticateTokenAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.name = req.body.name;
        user.profileImage = req.body.profileImage;
        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete user by admin
app.delete('/user/:id', authenticateTokenAdmin, async (req, res) => {
    try {
        await User.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PORT Setup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));