CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS salary;
CREATE SCHEMA IF NOT EXISTS community;
CREATE TABLE IF NOT EXISTS identity.users (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS identity.tokens (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);


CREATE TABLE IF NOT EXISTS salary.submissions (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    role                 VARCHAR(120) NOT NULL,
    company              VARCHAR(120),
    level                VARCHAR(60),
    location             VARCHAR(120),
    salary_amount        NUMERIC(14,2) NOT NULL,
    currency             VARCHAR(10)  NOT NULL DEFAULT 'LKR',
    years_of_experience  SMALLINT,
    tech_stack           TEXT,
    anonymize            BOOLEAN      NOT NULL DEFAULT TRUE,
    status               VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                           CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    submitted_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    approved_at          TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS salary.aggregates (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    role         VARCHAR(120),
    location     VARCHAR(120),
    currency     VARCHAR(10)  NOT NULL DEFAULT 'LKR',
    avg_salary   NUMERIC(14,2),
    median_salary NUMERIC(14,2),
    min_salary   NUMERIC(14,2),
    max_salary   NUMERIC(14,2),
    p25_salary   NUMERIC(14,2),
    p75_salary   NUMERIC(14,2),
    sample_count INTEGER,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community.votes (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID        NOT NULL REFERENCES salary.submissions(id) ON DELETE CASCADE,
    user_id       UUID        NOT NULL REFERENCES identity.users(id)     ON DELETE CASCADE,
    vote_type     VARCHAR(10) NOT NULL CHECK (vote_type IN ('up','down')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (submission_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_status   ON salary.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_role     ON salary.submissions(role);
CREATE INDEX IF NOT EXISTS idx_submissions_company  ON salary.submissions(company);
CREATE INDEX IF NOT EXISTS idx_submissions_location ON salary.submissions(location);
CREATE INDEX IF NOT EXISTS idx_votes_submission     ON community.votes(submission_id);



CREATE TABLE IF NOT EXISTS community.reports (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID        NOT NULL REFERENCES salary.submissions(id) ON DELETE CASCADE,
    user_id       UUID        NOT NULL REFERENCES identity.users(id)     ON DELETE CASCADE,
    reason        VARCHAR(50) NOT NULL CHECK (reason IN ('fake','duplicate','inappropriate','other')),
    comment       TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (submission_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_submission ON community.reports(submission_id);

