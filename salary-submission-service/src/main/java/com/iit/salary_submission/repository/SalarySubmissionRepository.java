package com.iit.salary_submission.repository;

import com.iit.salary_submission.model.SalarySubmission;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class SalarySubmissionRepository {

    private static final String TABLE_NAME = "salary.submissions";

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<SalarySubmission> rowMapper = (rs, rowNum) -> {
        SalarySubmission submission = new SalarySubmission();
        submission.setId(rs.getString("id"));
        submission.setCountry(rs.getString("country"));
        submission.setCompany(rs.getString("company"));
        submission.setRole(rs.getString("role"));
        submission.setLevel(rs.getString("level"));
        submission.setYearsExperience(rs.getInt("years_experience"));
        submission.setAmount(rs.getDouble("amount"));
        submission.setCurrency(rs.getString("currency"));
        submission.setStatus(rs.getString("status"));
        submission.setAnonymized(rs.getBoolean("anonymized"));
        submission.setUpvotes(rs.getInt("upvotes"));
        submission.setDownvotes(rs.getInt("downvotes"));
        return submission;
    };

    public SalarySubmissionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void ensureTableExists() {
        jdbcTemplate.execute("""
            CREATE SCHEMA IF NOT EXISTS salary;
            """);

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS salary.submissions (
                    id VARCHAR(64) PRIMARY KEY,
                    country VARCHAR(8) NOT NULL,
                    company VARCHAR(255) NOT NULL,
                    role VARCHAR(255) NOT NULL,
                    level VARCHAR(64),
                    years_experience INTEGER NOT NULL DEFAULT 0,
                    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
                    currency VARCHAR(8),
                    status VARCHAR(32),
                    anonymized BOOLEAN NOT NULL DEFAULT TRUE,
                    upvotes INTEGER NOT NULL DEFAULT 0,
                    downvotes INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """);
    }

    public void save(SalarySubmission submission) {
        jdbcTemplate.update(String.format("""
                INSERT INTO %s
                (id, country, company, role, level, years_experience, amount, currency, status, anonymized, upvotes, downvotes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (id) DO UPDATE SET
                    country = EXCLUDED.country,
                    company = EXCLUDED.company,
                    role = EXCLUDED.role,
                    level = EXCLUDED.level,
                    years_experience = EXCLUDED.years_experience,
                    amount = EXCLUDED.amount,
                    currency = EXCLUDED.currency,
                    status = EXCLUDED.status,
                    anonymized = EXCLUDED.anonymized,
                    upvotes = EXCLUDED.upvotes,
                    downvotes = EXCLUDED.downvotes
                """, TABLE_NAME),
                submission.getId(),
                submission.getCountry(),
                submission.getCompany(),
                submission.getRole(),
                submission.getLevel(),
                submission.getYearsExperience(),
                submission.getAmount(),
                submission.getCurrency(),
                submission.getStatus(),
                submission.isAnonymized(),
                submission.getUpvotes(),
                submission.getDownvotes());
    }

    public Optional<SalarySubmission> findById(String id) {
        List<SalarySubmission> matches = jdbcTemplate.query(
            String.format("SELECT id, country, company, role, level, years_experience, amount, currency, status, anonymized, upvotes, downvotes FROM %s WHERE id = ?", TABLE_NAME),
                rowMapper,
                id);
        return matches.stream().findFirst();
    }

    public List<SalarySubmission> findAll() {
        return jdbcTemplate.query(
            String.format("SELECT id, country, company, role, level, years_experience, amount, currency, status, anonymized, upvotes, downvotes FROM %s ORDER BY created_at DESC", TABLE_NAME),
                rowMapper);
    }
}