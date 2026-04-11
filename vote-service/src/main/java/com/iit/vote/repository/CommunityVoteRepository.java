package com.iit.vote.repository;

import com.iit.vote.entity.CommunityVote;
import com.iit.vote.model.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CommunityVoteRepository extends JpaRepository<CommunityVote, Long> {

    Optional<CommunityVote> findBySubmissionIdAndUserId(String submissionId, UUID userId);

    long countBySubmissionIdAndVoteType(String submissionId, VoteType voteType);
}
