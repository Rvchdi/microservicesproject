const express = require('express');
const { PrismaClient } = require('@prisma/client');
const initialPrisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;
const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'Auth Service is running' });
});

// Register
app.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await initialPrisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await initialPrisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await initialPrisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Validation endpoint for Gateway/Other services
app.post('/validate', async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ valid: false, error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // define prisma client to check if user still exists if needed, but for stateless JWT verification is enough
        // Ideally checking DB ensures user wasn't deleted/banned
        const user = await initialPrisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(401).json({ valid: false, error: 'User not found' });
        }

        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false, error: 'Invalid token' });
    }
});

app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
