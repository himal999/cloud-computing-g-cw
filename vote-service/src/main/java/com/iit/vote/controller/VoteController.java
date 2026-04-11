package com.iit.vote.controller;

import com.iit.vote.model.VoteRequest;
import com.iit.vote.model.VoteResponse;
import com.iit.vote.service.VoteApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vote")
public class VoteController {

    private final VoteApplicationService voteApplicationService;

    public VoteController(VoteApplicationService voteApplicationService) {
        this.voteApplicationService = voteApplicationService;
    }

    @PostMapping({ "", "/" })
    public ResponseEntity<?> vote(@RequestBody VoteRequest req) {
        try {
            VoteResponse body = voteApplicationService.applyVote(req);
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/{submissionId}")
    public VoteResponse getVoteCount(@PathVariable String submissionId) {
        return voteApplicationService.countsFor(submissionId);
    }
}
