--GOES INTO SQL
CREATE DATABASE IF NOT EXISTS psu_tutor_portal;
USE psu_tutor_portal;

--users who sign up or log in)
CREATE TABLE IF NOT EXISTS members (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    phone       VARCHAR(20),
    grad_year   VARCHAR(10)   NOT NULL,
    affiliation VARCHAR(200)  NOT NULL,
    password    VARCHAR(255)  NOT NULL,  
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--PRODUCTS (tutor listings) 
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    item_id     VARCHAR(50)   NOT NULL UNIQUE,  
    name        VARCHAR(100)  NOT NULL,
    description TEXT,
    email       VARCHAR(150)  NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    hours       VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--BILLING 
CREATE TABLE IF NOT EXISTS billing (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_name    VARCHAR(100)  NOT NULL,
    student_email   VARCHAR(150)  NOT NULL,
    payment_method  VARCHAR(50)   NOT NULL,
    card_number     VARCHAR(20)   NOT NULL,
    cart_items      JSON,                       
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RETURNS 
CREATE TABLE IF NOT EXISTS returns (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    reason       TEXT         NOT NULL,
    condition_   VARCHAR(50)  NOT NULL,
    status       VARCHAR(50)  NOT NULL DEFAULT 'Pending',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
