

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS salary;
CREATE SCHEMA IF NOT EXISTS community;

CREATE TABLE IF NOT EXISTS identity.users (
    id          UUID PRIMARY KEY,
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
