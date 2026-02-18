const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8003;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'Product Service is running' });
});

// List Products
app.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});

// Get Product by ID
app.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
});

// Create Product
app.post('/', async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock) || 0
            }
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
});

// Update Product
app.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock } = req.body;
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock) : undefined
            }
        });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
});

// Delete Product
app.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
});

app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});
