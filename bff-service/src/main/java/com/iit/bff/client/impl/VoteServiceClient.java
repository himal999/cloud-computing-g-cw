package com.iit.bff.client.impl;

import com.iit.bff.dto.request.VoteSubmitRequest;
import com.iit.bff.dto.response.VoteResponseDto;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class VoteServiceClient {

    private final WebClient voteWebClient;

    public VoteServiceClient(@Qualifier("voteWebClient") WebClient voteWebClient) {
        this.voteWebClient = voteWebClient;
    }

    public Mono<VoteResponseDto> submitVote(String userId, VoteSubmitRequest request) {
        Map<String, String> body = new HashMap<>();
        body.put("submissionId", request.getSubmissionId());
        body.put("voteType", request.getVoteType());
        body.put("userId", userId);
        return voteWebClient.post()
                .uri("/vote")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(VoteResponseDto.class);
    }

    public Mono<VoteResponseDto> getCounts(String submissionId) {
        return voteWebClient.get()
                .uri("/vote/{id}", submissionId)
                .retrieve()
                .bodyToMono(VoteResponseDto.class);
    }
}
