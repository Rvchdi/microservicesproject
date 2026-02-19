const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8004;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'Sales Service is running' });
});

// List Sales
app.get('/', async (req, res) => {
    try {
        const sales = await prisma.sale.findMany();
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sales' });
    }
});

// Create Sale
app.post('/', async (req, res) => {
    try {
        const { productId, customerId, quantity, total, status } = req.body;
        if (!productId || !customerId || !quantity || !total) return res.status(400).json({ error: 'Product ID, Customer ID, quantity and total are required' });

        const newSale = await prisma.sale.create({
            data: {
                productId: parseInt(productId),
                customerId: parseInt(customerId),
                quantity: parseInt(quantity),
                total: parseFloat(total),
                status: status || "new"
            }
        });
        res.status(201).json(newSale);
    } catch (error) {
        res.status(500).json({ error: 'Error creating sale' });
    }
});

// Update Sale Status
app.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) return res.status(400).json({ error: 'Status is required' });

        const updatedSale = await prisma.sale.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json(updatedSale);
    } catch (error) {
        res.status(500).json({ error: 'Error updating sale status' });
    }
});

// Get Sales by Customer ID
app.get('/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const sales = await prisma.sale.findMany({
            where: { customerId: parseInt(customerId) }
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching customer sales' });
    }
});

// Get Sale by ID
app.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await prisma.sale.findUnique({
            where: { id: parseInt(id) }
        });
        if (!sale) return res.status(404).json({ error: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sale' });
    }
});

app.listen(PORT, () => {
    console.log(`Sales Service running on port ${PORT}`);
});
