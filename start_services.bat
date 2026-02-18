@echo off
echo Starting all services...

cd services/gateway
start "Gateway (8000)" cmd /k "node index.js"
cd ../..

cd services/auth
start "Auth Service (8001)" cmd /k "node index.js"
cd ../..

cd services/customer
start "Customer Service (8002)" cmd /k "node index.js"
cd ../..

cd services/product
start "Product Service (8003)" cmd /k "node index.js"
cd ../..

cd services/sales
start "Sales Service (8004)" cmd /k "node index.js"
cd ../..

cd services/invoice
start "Invoice Service (8005)" cmd /k "node index.js"
cd ../..

echo All services attempt to start. Check individual windows for logs.
