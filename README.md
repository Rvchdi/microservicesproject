# Microservices Project

A Node.js & Express microservices architecture with separate services for authentication, customers, products, sales, invoices, and API gateway.

## Services

- **auth** - Authentication service
- **customer** - Customer management service  
- **gateway** - API Gateway service
- **invoice** - Invoice management service
- **product** - Product management service
- **sales** - Sales management service

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Quick Installation

Use the automated installation scripts to install dependencies for all services:

#### Windows (PowerShell):
```powershell
.\install-dependencies.ps1
```

#### Linux/macOS (Bash):
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### Manual Installation

If you prefer to install dependencies manually:

```bash
# Navigate to each service directory and run:
cd services/auth
npm install

cd ../customer
npm install

cd ../gateway
npm install

cd ../invoice
npm install

cd ../product
npm install

cd ../sales
npm install
```

## Project Structure

```
microservicesproject/
├── services/
│   ├── auth/
│   ├── customer/
│   ├── gateway/
│   ├── invoice/
│   ├── product/
│   └── sales/
├── install-dependencies.sh    # Linux/macOS installation script
├── install-dependencies.ps1   # Windows installation script
└── README.md
```

## Usage

Each service can be started independently. Navigate to the service directory and run:

```bash
cd services/[service-name]
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit and push to your fork
5. Submit a pull request 
