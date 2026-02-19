const http = require('http');

const makeRequest = (path, method, body) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000, // API Gateway
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data); // For non-JSON responses
                    }
                } else {
                    reject({ statusCode: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const runTest = async () => {
    try {
        console.log('--- Starting Full Flow Test ---');

        // 1. Create Product
        console.log('\n1. Creating Product...');
        const product = await makeRequest('/products', 'POST', {
            name: "Integration Test Laptop",
            description: "Tested via script",
            price: 1200.50,
            stock: 50
        });
        console.log('✅ Product Created:', product);
        const productId = product.id;

        // 2. Create Customer
        console.log('\n2. Creating Customer...');
        const uniqueEmail = `test.user.${Date.now()}@example.com`;
        const customer = await makeRequest('/customers', 'POST', {
            name: "Test User",
            email: uniqueEmail,
            phone: "1234567890",
            address: "123 Test St"
        });
        console.log('✅ Customer Created:', customer);
        // Note: Sales service didn't require customerId in the schema I saw, but logically it should.
        // Checking schema: Sale { productId, quantity, total, date }. No customerId.
        // This is a schema gap, but I will proceed with what exists.

        // 3. Create Sale
        console.log('\n3. Creating Sale...');
        const quantity = 2;
        const total = product.price * quantity;
        const sale = await makeRequest('/sales', 'POST', {
            productId: productId,
            quantity: quantity,
            total: total
        });
        console.log('✅ Sale Created:', sale);
        const saleId = sale.id;

        // 4. Create Invoice
        console.log('\n4. Creating Invoice...');
        const invoice = await makeRequest('/invoices', 'POST', {
            saleId: saleId,
            amount: total
        });
        console.log('✅ Invoice Created:', invoice);

        console.log('\n--- Test Completed Successfully ---');

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    }
};

runTest();
