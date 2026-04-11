package com.iit.vote.entity;

import com.iit.vote.model.VoteType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "votes", schema = "community")
public class CommunityVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_id", nullable = false, length = 64)
    private String submissionId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", nullable = false, length = 8)
    private VoteType voteType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected CommunityVote() {
    }

    public CommunityVote(String submissionId, UUID userId, VoteType voteType) {
        this.submissionId = submissionId;
        this.userId = userId;
        this.voteType = voteType;
    }

    public Long getId() {
        return id;
    }

    public String getSubmissionId() {
        return submissionId;
    }

    public UUID getUserId() {
        return userId;
    }

    public VoteType getVoteType() {
        return voteType;
    }

    public void setVoteType(VoteType voteType) {
        this.voteType = voteType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
