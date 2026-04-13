

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS salary;
CREATE SCHEMA IF NOT EXISTS community;

CREATE TABLE IF NOT EXISTS identity.users (
    id          UUID PRIMARY KEY,
    first_name  VARCHAR(100),
    last_name   VARCHAR(100),
    email       VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS identity.sessions (
    token     VARCHAR(128) PRIMARY KEY,
    user_id   UUID NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community.votes (
    id             BIGSERIAL PRIMARY KEY,
    submission_id  VARCHAR(64) NOT NULL,
    user_id        UUID NOT NULL,
    vote_type      VARCHAR(8) NOT NULL CHECK (vote_type IN ('UP', 'DOWN')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (submission_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_submission ON community.votes (submission_id);

CREATE TABLE IF NOT EXISTS salary.submissions (
    id               VARCHAR(64) PRIMARY KEY,
    country          VARCHAR(8) NOT NULL,
    company          VARCHAR(255) NOT NULL,
    role             VARCHAR(255) NOT NULL,
    level            VARCHAR(64),
    years_experience INTEGER NOT NULL DEFAULT 0,
    amount           NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency         VARCHAR(8),
    status           VARCHAR(32),
    anonymized       BOOLEAN NOT NULL DEFAULT TRUE,
    upvotes          INTEGER NOT NULL DEFAULT 0,
    downvotes        INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


