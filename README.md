# Payment Backend API (Technical Test)

This is a robust Payment Backend API built with **NestJS**, following **Clean Code** principles, **Hexagonal Architecture** (Ports and Adapters), and **SOLID** principles.

It integrates with the  Payment Gateway (Sandbox UAT) to process payments and manages an inventory of products using TypeORM (MySQL).

## 🚀 Technologies Used
- Node.js (v20)
- NestJS
- TypeScript
- TypeORM (MySQL)
- Jest (Unit Testing)
- class-validator / class-transformer
- Docker

## 🏗️ Architecture (Hexagonal)
The project is strictly divided into 3 layers:
1. **Domain Layer (`src/domain`):** Contains the business logic, Models (`Product`, `Transaction`), and Ports (Interfaces for Repositories and Gateways). It has **zero dependencies** on external libraries.
2. **Application Layer (`src/application`):** Contains the Use Cases (`ProcessPaymentUseCase`, `GetProductsUseCase`). It orchestrates the domain models and ports.
3. **Infrastructure Layer (`src/infrastructure`):** Contains the actual implementations (Adapters). 
   - `persistence`: MySQL TypeORM repositories.
   - `external`:  API HTTP adapter.
   - `controllers`: REST API endpoints and DTOs.

## 🛠️ Setup Instructions

### 1. Database Setup
You will need a MySQL database running. You can use XAMPP, Docker, or a local MySQL server.
1. Create a database named `payments_db`.
2. Run the provided `init.sql` script in your MySQL client to create the tables (`products`, `transactions`, `transaction_logs`) and insert the dummy data.

### 2. Environment Variables
Create a `.env` file in the root of the project with the following keys:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=payments_db

_API_URL=https://sandbox..co/v1
_PUBLIC_KEY=
_PRIVATE_KEY=
```

### 3. Installation
```bash
npm install
```

### 4. Running the App
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

The API will be available at `http://localhost:3000`.

## 🧪 Running Unit Tests
Unit tests have been written using Jest, focusing on the core business logic (Domain and Use Cases).

```bash
# Run tests
npm run test

# Run tests and generate coverage report
npm run test:cov
```

## 🐳 Docker (Deployment)
To build and run the application using Docker:

```bash
# Build the image
docker build -t payment-backend .

# Run the container (Make sure to pass the .env variables or link to a DB)
docker run -p 3000:3000 --env-file .env payment-backend
```

## 📝 Endpoints

### 1. Get Products
`GET /products`
Returns the list of available products with their current stock and prices.

### 2. Process Payment
`POST /payments`
```json
{
  "productId": "e2b6911c-772b-4171-8bc4-7eb38b971a81",
  "amount": 150000,
  "customerEmail": "test@domain.com",
  "creditCardToken": "tok_test_4242",
  "installments": 1
}
```
Processes the payment via , updates stock, and registers the transaction log.
