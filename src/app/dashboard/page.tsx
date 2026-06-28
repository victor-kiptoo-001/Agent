-- CREATE PRODUCTS TABLE
create table products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    sku text unique not null,
    stock_quantity integer not null default 0,
    price decimal(10, 2) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CREATE ORDERS TABLE
create table orders (
    id uuid default gen_random_uuid() primary key,
    customer_name text not null,
    customer_phone text,
    total_amount decimal(10, 2) not null,
    status text not null default 'pending', -- pending, completed, cancelled
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CREATE ORDER ITEMS (Junction table for many-to-many relationship)
create table order_items (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references orders(id) on delete cascade not null,
    product_id uuid references products(id) on delete restrict not null,
    quantity integer not null,
    price_at_sale decimal(10, 2) not null
);