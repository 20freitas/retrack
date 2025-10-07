-- Create sales table for tracking all reseller sales
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  product_id UUID,  -- optional reference to products table if sale came from stock
  product_title TEXT NOT NULL,
  product_image TEXT,  -- URL of the product image
  sale_price NUMERIC(10,2) NOT NULL,
  sale_date DATE NOT NULL,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  platform_fee NUMERIC(10,2) DEFAULT 0,
  platform TEXT,
  purchase_price NUMERIC(10,2) DEFAULT 0,
  profit NUMERIC(10,2),
  margin NUMERIC(10,2),  -- percentage
  roi NUMERIC(10,2),  -- percentage (Return on Investment)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on owner_id for faster queries
CREATE INDEX IF NOT EXISTS idx_sales_owner_id ON sales(owner_id);

-- Create index on sale_date for date-based filtering
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date DESC);

-- Create index on platform for platform filtering
CREATE INDEX IF NOT EXISTS idx_sales_platform ON sales(platform);

-- Optional: Add foreign key constraint if you want to link sales to products
-- ALTER TABLE sales ADD CONSTRAINT fk_sales_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- If table already exists without product_image column, add it:
-- ALTER TABLE sales ADD COLUMN IF NOT EXISTS product_image TEXT;

-- Optional: Add RLS (Row Level Security) policies
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own sales
-- CREATE POLICY "Users can view own sales" ON sales FOR SELECT USING (auth.uid() = owner_id);

-- Allow users to insert their own sales
-- CREATE POLICY "Users can insert own sales" ON sales FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own sales
-- CREATE POLICY "Users can update own sales" ON sales FOR UPDATE USING (auth.uid() = owner_id);

-- Allow users to delete their own sales
-- CREATE POLICY "Users can delete own sales" ON sales FOR DELETE USING (auth.uid() = owner_id);
