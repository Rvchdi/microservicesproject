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

// Low Stock Alert
app.get('/low-stock', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                stock: {
                    lte: prisma.product.fields.lowStockThreshold
                }
            }
        });
        // Prisma doesn't support comparing two fields in where clause directly in all versions/databases easily.
        // A raw query or in-memory filtering is safer for compatibility if the above fails, but let's try raw query for robustness OR simple filtering.
        // Actually, for simple logic, let's fetch all and filter or use raw query.
        // Let's use raw query for efficiency or just fetch where stock is low if threshold was constant.
        // Since threshold is per product, we need column comparison.

        const lowStockProducts = await prisma.$queryRaw`SELECT * FROM Product WHERE stock <= lowStockThreshold`;
        // Note: Prisma returns BigInt for some math operations/IDs in Raw, need to serialize.
        // But for this simple schema, it should be fine. 
        // JSON serialization of BigInt fails. Let's do in-memory for safety as the dataset is likely small for this demo, 
        // OR better: handle serialization helper.

        // Let's stick to standard findMany and filter in JS for safety and avoiding raw query syntax issues across DBs,
        // unless dataset is huge. For this demo, JS filtering is fine.
        const allProducts = await prisma.product.findMany();
        const alerts = allProducts.filter(p => p.stock <= p.lowStockThreshold);

        res.json(alerts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching low stock products' });
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
        const { name, description, price, stock, imageUrl, lowStockThreshold } = req.body;
        if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                imageUrl,
                lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 10
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
        const { name, description, price, stock, imageUrl, lowStockThreshold } = req.body;
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock) : undefined,
                imageUrl,
                lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : undefined
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
