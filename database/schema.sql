-- -----------------------------------------------
-- Ecommerce Search POC — Schema
-- -----------------------------------------------

CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- Categories (hierarchical tree)
CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id  INT UNSIGNED DEFAULT NULL,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_category_parent FOREIGN KEY (parent_id)
    REFERENCES categories (id)
    ON DELETE SET NULL
);

CREATE INDEX idx_categories_parent ON categories (parent_id);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id                    INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  navigation_id         VARCHAR(64)    NOT NULL UNIQUE,
  title                 VARCHAR(255)   NOT NULL,
  description           TEXT,
  price                 DECIMAL(10, 2) NOT NULL,
  seller                VARCHAR(100),
  qty_sold_last_30_days INT UNSIGNED   DEFAULT 0,
  image                 VARCHAR(512),
  category_id           INT UNSIGNED,

  -- TASK05: disponibilidade e status
  stock                 INT UNSIGNED   DEFAULT 100  COMMENT 'Unidades em estoque. 0 = esgotado.',
  is_active             TINYINT(1)     DEFAULT 1    COMMENT '1 = ativo, 0 = inativo/descontinuado',

  rating_average        DECIMAL(3, 2)  DEFAULT 0.00,
  rating_count          INT UNSIGNED   DEFAULT 0,
  created_at            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_product_category FOREIGN KEY (category_id)
    REFERENCES categories (id)
    ON DELETE SET NULL
);

CREATE INDEX idx_products_category  ON products (category_id);
CREATE INDEX idx_products_title     ON products (title);
CREATE INDEX idx_products_active    ON products (is_active);
CREATE FULLTEXT INDEX ft_products_search ON products (title, description);