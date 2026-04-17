-- Initialize database schemas and tables for techsalary application

-- Create identity schema
CREATE SCHEMA IF NOT EXISTS identity;

-- Create salary schema
CREATE SCHEMA IF NOT EXISTS salary;

-- Create vote schema
CREATE SCHEMA IF NOT EXISTS vote;

-- Users table in identity schema
CREATE TABLE IF NOT EXISTS identity.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salary data table in salary schema
CREATE TABLE IF NOT EXISTS salary.salary_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES identity.users(id),
    company VARCHAR(255),
    position VARCHAR(255),
    salary DECIMAL(10,2),
    years_experience INTEGER,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes table in vote schema
CREATE TABLE IF NOT EXISTS vote.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES identity.users(id),
    salary_data_id UUID REFERENCES salary.salary_data(id),
    vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
