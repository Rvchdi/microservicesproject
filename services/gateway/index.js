const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

// Service Routes Configuration
const services = [
    {
        route: "/auth",
        target: process.env.AUTH_SERVICE_URL || "http://localhost:8001",
    },
    {
        route: "/customers",
        target: process.env.CUSTOMER_SERVICE_URL || "http://localhost:8002",
    },
    {
        route: "/products",
        target: process.env.PRODUCT_SERVICE_URL || "http://localhost:8003",
    },
    {
        route: "/sales",
        target: process.env.SALES_SERVICE_URL || "http://localhost:8004",
    },
    {
        route: "/invoices",
        target: process.env.INVOICE_SERVICE_URL || "http://localhost:8005",
    },
];

// Proxy Setup
services.forEach(({ route, target }) => {
    app.use(
        route,
        createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: {
                [`^${route}`]: "",
            },
        })
    );
});

// Root Route
app.get('/health', (req, res) => {
    res.send({ message: 'API Gateway is running' });
});

app.listen(PORT, () => {
    console.log(`Gateway Service running on port ${PORT}`);
});
