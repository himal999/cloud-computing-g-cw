package com.iit.identity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sessions", schema = "identity")
public class SessionToken {

    @Id
    @Column(length = 128)
    private String token;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected SessionToken() {
    }

    public SessionToken(String token, UserAccount user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public UserAccount getUser() {
        return user;
    }

    public UUID getUserId() {
        return user.getId();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
