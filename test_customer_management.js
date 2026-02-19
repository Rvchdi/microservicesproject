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
        console.log('--- Starting Customer Management Verification ---');

        // 1. Create Product
        console.log('\n1. Creating Product...');
        const product = await makeRequest('/products', 'POST', {
            name: "Customer Test Product",
            description: "For testing history",
            price: 50.00,
            stock: 100
        });
        console.log('✅ Product Created:', product.id);

        // 2. Create Customer
        console.log('\n2. Creating Customer...');
        const uniqueEmail = `history.test.${Date.now()}@example.com`;
        const customer = await makeRequest('/customers', 'POST', {
            name: "History Monitor",
            email: uniqueEmail,
            phone: "555-0199",
            address: "Data Lane"
        });
        console.log('✅ Customer Created:', customer.id);

        // 3. Create Sale linked to Customer
        console.log('\n3. Creating Sale linked to Customer...');
        const sale = await makeRequest('/sales', 'POST', {
            productId: product.id,
            customerId: customer.id,
            quantity: 1,
            total: 50.00
        });
        console.log('✅ Sale Created:', sale.id);

        // 4. Verify Purchase History
        console.log('\n4. Verifying Purchase History...');
        const customerProfile = await makeRequest(`/customers/${customer.id}`, 'GET');
        if (customerProfile.sales && customerProfile.sales.length > 0) {
            console.log('✅ History Verified: Sales found in customer profile.');
            console.log('   Sales Count:', customerProfile.sales.length);
        } else {
            console.error('❌ History Verification Failed: No sales found in profile.');
            console.log('   Profile:', JSON.stringify(customerProfile, null, 2));
        }

        // 5. Verify Filtering
        console.log('\n5. Verifying Search/Filtering...');
        const searchResults = await makeRequest('/customers?name=Monitor', 'GET');
        if (searchResults.length > 0 && searchResults[0].name === "History Monitor") {
            console.log('✅ Filtering Verified: Found customer by name.');
        } else {
            console.error('❌ Filtering Verification Failed.');
            console.log('   Results:', JSON.stringify(searchResults, null, 2));
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    }
};

runTest();
