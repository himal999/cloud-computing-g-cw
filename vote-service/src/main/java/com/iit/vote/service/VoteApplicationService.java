package com.iit.vote.service;

import com.iit.vote.entity.CommunityVote;
import com.iit.vote.model.VoteRequest;
import com.iit.vote.model.VoteResponse;
import com.iit.vote.model.VoteType;
import com.iit.vote.repository.CommunityVoteRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Locale;
import java.util.UUID;

@Service
public class VoteApplicationService {

    private final CommunityVoteRepository voteRepository;
    private final RestTemplate restTemplate;

    @Value("${vote.approval.threshold:3}")
    private int approvalThreshold;

    @Value("${salary.service.url:http://localhost:8082}")
    private String salaryServiceBaseUrl;

    public VoteApplicationService(CommunityVoteRepository voteRepository, RestTemplate restTemplate) {
        this.voteRepository = voteRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional
    public VoteResponse applyVote(VoteRequest req) {
        if (req.getSubmissionId() == null || req.getVoteType() == null || req.getUserId() == null) {
            throw new IllegalArgumentException("submissionId, voteType, userId required");
        }
        String submissionId = req.getSubmissionId().trim();
        UUID userId = parseUserId(req.getUserId());
        VoteType newType = parseVoteType(req.getVoteType());

        CommunityVote existing = voteRepository.findBySubmissionIdAndUserId(submissionId, userId).orElse(null);
        if (existing == null) {
            voteRepository.save(new CommunityVote(submissionId, userId, newType));
        } else if (existing.getVoteType() != newType) {
            existing.setVoteType(newType);
        }

        long up = voteRepository.countBySubmissionIdAndVoteType(submissionId, VoteType.UP);
        long down = voteRepository.countBySubmissionIdAndVoteType(submissionId, VoteType.DOWN);

        if (up >= approvalThreshold) {
            notifySalaryApproved(submissionId);
        }

        return new VoteResponse(submissionId, (int) up, (int) down);
    }

    @Transactional(readOnly = true)
    public VoteResponse countsFor(String submissionId) {
        String sid = submissionId.trim();
        long up = voteRepository.countBySubmissionIdAndVoteType(sid, VoteType.UP);
        long down = voteRepository.countBySubmissionIdAndVoteType(sid, VoteType.DOWN);
        return new VoteResponse(sid, (int) up, (int) down);
    }

    private void notifySalaryApproved(String submissionId) {
        String url = salaryServiceBaseUrl.replaceAll("/$", "") + "/salary/" + submissionId + "/approve";
        try {
            restTemplate.postForEntity(url, null, Void.class);
        } catch (RestClientException ignored) {
            throw ignored;
        }
    }

    private static UUID parseUserId(String raw) {
        try {
            return UUID.fromString(raw.trim());
        } catch (Exception ex) {
            throw new IllegalArgumentException("userId must be a UUID");
        }
    }

    private static VoteType parseVoteType(String raw) {
        String v = raw.trim().toUpperCase(Locale.ROOT);
        if ("UP".equals(v)) {
            return VoteType.UP;
        }
        if ("DOWN".equals(v)) {
            return VoteType.DOWN;
        }
        throw new IllegalArgumentException("voteType must be UP or DOWN");
    }
}
