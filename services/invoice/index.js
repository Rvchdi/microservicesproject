const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8005;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'Invoice Service is running' });
});

// List Invoices
app.get('/', async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoices' });
    }
});

// Create Invoice
app.post('/', async (req, res) => {
    try {
        const { saleId, amount } = req.body;
        if (!saleId || !amount) return res.status(400).json({ error: 'Sale ID and amount are required' });

        const newInvoice = await prisma.invoice.create({
            data: {
                saleId: parseInt(saleId),
                amount: parseFloat(amount)
            }
        });
        res.status(201).json(newInvoice);
    } catch (error) {
        res.status(500).json({ error: 'Error creating invoice' });
    }
});

// Get Invoice by ID
app.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(id) }
        });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoice' });
    }
});


app.listen(PORT, () => {
    console.log(`Invoice Service running on port ${PORT}`);
});
