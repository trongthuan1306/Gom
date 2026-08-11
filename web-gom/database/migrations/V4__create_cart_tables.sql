CREATE TABLE carts (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
    id         BIGSERIAL    PRIMARY KEY,
    cart_id    BIGINT       NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER      NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_cart_product UNIQUE (cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
