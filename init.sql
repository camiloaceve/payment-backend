CREATE DATABASE IF NOT EXISTS wompi_test;
USE wompi_test;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  reference VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(255) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  customerEmail VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_logs (
  id VARCHAR(36) PRIMARY KEY,
  transactionId VARCHAR(36) NOT NULL,
  status VARCHAR(255) NOT NULL,
  timestamp DATETIME NOT NULL,
  notes TEXT,
  FOREIGN KEY (transactionId) REFERENCES transactions(id)
);

-- Insert dummy products for testing
INSERT IGNORE INTO products (id, name, price, stock) VALUES ('e2b6911c-772b-4171-8bc4-7eb38b971a81', 'Auriculares Inalámbricos', 150000.00, 10);
INSERT IGNORE INTO products (id, name, price, stock) VALUES ('9f6c770c-261c-4389-9bd1-fb45f062d854', 'Teclado Mecánico', 250000.00, 5);
