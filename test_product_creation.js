const http = require('http');

const performRequest = () => {
    const data = JSON.stringify({
        name: "Test Laptop",
        description: "A high-end laptop for testing purposes",
        price: 1500.00,
        stock: 10
    });

    const options = {
        hostname: 'localhost',
        port: 8000, // Gateway port
        path: '/products',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(data);
    req.end();
};

performRequest();
