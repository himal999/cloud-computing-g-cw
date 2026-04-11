-- Migration script to add first_name and last_name columns to users table
-- Run this script on existing database to add the new columns

ALTER TABLE identity.users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Optional: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_first_name ON identity.users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON identity.users(last_name);
