const http = require('http');

const makeRequest = (path, method, body) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (body) options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
                } else {
                    reject({ statusCode: res.statusCode, body: data });
                }
            });
        });
        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

const runTest = async () => {
    try {
        console.log('--- Starting Inventory Management Verification ---');

        // 1. Create Normal Product
        console.log('\n1. Creating Normal Product...');
        const normalProduct = await makeRequest('/products', 'POST', {
            name: "High Stock Item",
            description: "Plenty available",
            price: 10.00,
            stock: 100,
            imageUrl: "http://example.com/high.jpg",
            lowStockThreshold: 10
        });
        console.log('✅ Normal Product Created:', normalProduct.id);

        // 2. Create Low Stock Product
        console.log('\n2. Creating Low Stock Product...');
        const lowStockProduct = await makeRequest('/products', 'POST', {
            name: "Low Stock Item",
            description: "Running out!",
            price: 20.00,
            stock: 5,
            imageUrl: "http://example.com/low.jpg",
            lowStockThreshold: 10
        });
        console.log('✅ Low Stock Product Created:', lowStockProduct.id);

        // 3. Verify Product Details (Image & Threshold)
        console.log('\n3. Verifying Product Details...');
        const details = await makeRequest(`/products/${lowStockProduct.id}`, 'GET');
        if (details.imageUrl === "http://example.com/low.jpg" && details.lowStockThreshold === 10) {
            console.log('✅ Details Verified: Image and Threshold saved correctly.');
        } else {
            console.error('❌ Details Verification Failed:', details);
        }

        // 4. Verify Low Stock Alert
        console.log('\n4. Verifying Low Stock Alert...');
        // Note: Route via gateway /products/low-stock might conflict if not configured or if route matching is strict.
        // Gateway maps /products -> Product Service. Product Service has GET /low-stock.
        // So /products/low-stock should hit Product Service GET /low-stock.
        // BUT: Product Service index.js has GET /:id which might capture 'low-stock' as an ID if defined before.
        // I put /low-stock BEFORE /:id in the code, so it should work.

        try {
            const alerts = await makeRequest('/products/low-stock', 'GET');
            const foundLowStock = alerts.find(p => p.id === lowStockProduct.id);
            const foundHighStock = alerts.find(p => p.id === normalProduct.id);

            if (foundLowStock && !foundHighStock) {
                console.log('✅ Low Stock Alert Verified: Found low stock item and excluded high stock item.');
                console.log('   Alerts Count:', alerts.length);
            } else {
                console.error('❌ Low Stock Alert Failed.');
                console.log('   Alerts:', JSON.stringify(alerts, null, 2));
            }
        } catch (e) {
            console.error('❌ Low Stock Alert Request Failed:', e);
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    }
};

runTest();
