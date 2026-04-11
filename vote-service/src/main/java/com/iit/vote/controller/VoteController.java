package com.iit.vote.controller;

import com.iit.vote.model.VoteRequest;
import com.iit.vote.model.VoteResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/vote")
public class VoteController {
    private static final int APPROVAL_THRESHOLD = 3;

    private final Map<String, Integer> upvotes = new ConcurrentHashMap<>();
    private final Map<String, Integer> downvotes = new ConcurrentHashMap<>();

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/")
    public ResponseEntity<?> vote(@RequestBody VoteRequest req) {
        if (req.getSubmissionId() == null || req.getVoteType() == null || req.getUserId() == null) {
            return ResponseEntity.badRequest().body("submissionId, voteType, userId required");
        }

        String submissionId = req.getSubmissionId();
        if ("UP".equalsIgnoreCase(req.getVoteType())) {
            upvotes.merge(submissionId, 1, (existing, increment) -> (existing == null ? 0 : existing) + increment);
        } else if ("DOWN".equalsIgnoreCase(req.getVoteType())) {
            downvotes.merge(submissionId, 1, (existing, increment) -> (existing == null ? 0 : existing) + increment);
        } else {
            return ResponseEntity.badRequest().body("voteType must be UP or DOWN");
        }

        int currentUp = upvotes.getOrDefault(submissionId, 0);
        int currentDown = downvotes.getOrDefault(submissionId, 0);

        if (currentUp >= APPROVAL_THRESHOLD) {
            // notify salary service to mark approved
            String salaryUrl = "http://localhost:8082/salary/" + submissionId + "/approve";
            try {
                restTemplate.postForEntity(salaryUrl, null, Map.class);
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok(new VoteResponse(submissionId, currentUp, currentDown));
    }

    @GetMapping("/{submissionId}")
    public VoteResponse getVoteCount(@PathVariable String submissionId) {
        return new VoteResponse(submissionId,
                upvotes.getOrDefault(submissionId,0),
                downvotes.getOrDefault(submissionId,0));
    }
}
