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
        console.log('--- Starting Sales Status Verification ---');

        // 1. Create Sale (Default Status)
        console.log('\n1. Creating Sale (Default Status)...');
        // Using existing product/customer IDs might be risky if DB was reset, but let's assume existence or create mocks.
        // Ideally should create fresh resources, but for brevity using arbitrary IDs (schema verification often doesn't check FK constraints in Prisma unless enabled/enforced by DB, and here services are decoupled).
        // Actually, creating fresh is safer.

        console.log('   Creating mock product/customer...');
        const product = await makeRequest('/products', 'POST', { name: "Status Test Item", price: 10, stock: 100 });
        const customer = await makeRequest('/customers', 'POST', { name: "Status Tester", email: `status.${Date.now()}@test.com` });

        const sale = await makeRequest('/sales', 'POST', {
            productId: product.id,
            customerId: customer.id,
            quantity: 1,
            total: 10.00
        });

        if (sale.status === 'new') {
            console.log('✅ Default Status Verified: "new"');
        } else {
            console.error('❌ Default Status Failed:', sale.status);
        }

        // 2. Update Status to "in_progress"
        console.log('\n2. Updating Status to "in_progress"...');
        const updatedSale = await makeRequest(`/sales/${sale.id}/status`, 'PUT', { status: 'in_progress' });

        if (updatedSale.status === 'in_progress') {
            console.log('✅ Status Update Verified: "in_progress"');
        } else {
            console.error('❌ Status Update Failed:', updatedSale.status);
        }

        // 3. Update Status to "completed"
        console.log('\n3. Updating Status to "completed"...');
        const completedSale = await makeRequest(`/sales/${sale.id}/status`, 'PUT', { status: 'completed' });

        if (completedSale.status === 'completed') {
            console.log('✅ Status Update Verified: "completed"');
        } else {
            console.error('❌ Status Update Failed:', completedSale.status);
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    }
};

runTest();
