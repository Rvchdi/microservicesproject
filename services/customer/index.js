const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8002;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'Customer Service is running' });
});

// List Customers
app.get('/', async (req, res) => {
    try {
        const customers = await prisma.customer.findMany();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching customers' });
    }
});

// Get Customer by ID
app.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(id) }
        });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching customer' });
    }
});

// Create Customer
app.post('/', async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

        const newCustomer = await prisma.customer.create({
            data: { name, email, phone, address }
        });
        res.status(201).json(newCustomer);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Error creating customer' });
    }
});

// Update Customer
app.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address } = req.body;
        const updatedCustomer = await prisma.customer.update({
            where: { id: parseInt(id) },
            data: { name, email, phone, address }
        });
        res.json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ error: 'Error updating customer' });
    }
});

// Delete Customer
app.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.customer.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting customer' });
    }
});

app.listen(PORT, () => {
    console.log(`Customer Service running on port ${PORT}`);
});
