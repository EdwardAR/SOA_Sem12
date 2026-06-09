CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  address VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(255),
  unit_price DECIMAL(12,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(80) NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL,
  status VARCHAR(40) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_details (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_details_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_details_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE inventory (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL UNIQUE,
  available_quantity INT NOT NULL,
  reserved_quantity INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 10,
  status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  invoice_number VARCHAR(80) NOT NULL UNIQUE,
  order_id BIGINT NOT NULL UNIQUE,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(40) NOT NULL,
  CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE shipments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  shipment_number VARCHAR(80) NOT NULL UNIQUE,
  order_id BIGINT NOT NULL UNIQUE,
  tracking_code VARCHAR(100),
  status VARCHAR(40) NOT NULL,
  shipped_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

INSERT INTO users (username, password, role, status) VALUES
('admin', '$2b$10$4X0/e2mjTOs3pBLDbAxGc.fl7agHDB5bnyvn3a4i8CIlE.uyOGCE.', 'ADMIN', 'ACTIVE');

INSERT INTO customers (code, name, email, phone, address, status) VALUES
('CUST-001', 'Northwind Retail', 'retail@northwind.com', '555-111', 'Seattle', 'ACTIVE');

INSERT INTO products (sku, name, description, unit_price, status) VALUES
('P-001', 'Chai', 'Té especiado', 18.50, 'ACTIVE');

INSERT INTO inventory (product_id, available_quantity, reserved_quantity, reorder_level, status) VALUES
(1, 120, 0, 10, 'AVAILABLE');
