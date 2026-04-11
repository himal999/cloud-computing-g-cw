package com.iit.bff.controller;

import com.iit.bff.client.impl.VoteServiceClient;
import com.iit.bff.dto.request.SignupRequest;
import com.iit.bff.dto.request.VoteSubmitRequest;
import com.iit.bff.dto.response.SignupResponse;
import com.iit.bff.dto.response.VoteResponseDto;
import com.iit.bff.service.UserIdentityProxy;
import com.iit.bff.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Your features: signup + session check + voting (login itself uses teammate {@code IdentityServiceClient}).
 */
@RestController
public class AuthVoteBffController {

    private final UserIdentityProxy userIdentityProxy;
    private final VoteServiceClient voteServiceClient;

    public AuthVoteBffController(UserIdentityProxy userIdentityProxy, VoteServiceClient voteServiceClient) {
        this.userIdentityProxy = userIdentityProxy;
        this.voteServiceClient = voteServiceClient;
    }

    @PostMapping("/api/v1/auth/signup")
    public Mono<ResponseEntity<ApiResponse<SignupResponse>>> signup(@RequestBody SignupRequest request) {
        return userIdentityProxy.signup(request)
                .map(api -> ResponseEntity
                        .status(api.isSuccess() ? 200 : (api.getErrorCode() > 0 ? api.getErrorCode() : 500))
                        .body(api));
    }

    @PostMapping("/api/v1/auth/register")
    public Mono<ResponseEntity<ApiResponse<SignupResponse>>> register(@RequestBody SignupRequest request) {
        return signup(request);
    }

    @GetMapping("/api/v1/auth/me")
    public Mono<ResponseEntity<ApiResponse<Map<String, String>>>> me(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String token = extractBearerToken(authorization);
        if (token == null) {
            return Mono.just(ResponseEntity.status(401)
                    .body(ApiResponse.error(List.of("Authorization Bearer token required"), 401)));
        }
        return userIdentityProxy.verifySessionToken(token)
                .map(userId -> ResponseEntity.ok(ApiResponse.success(Map.of("userId", userId))))
                .switchIfEmpty(Mono.just(ResponseEntity.status(401)
                        .body(ApiResponse.error(List.of("Invalid or expired session"), 401))));
    }

    @PostMapping("/api/v1/votes")
    public Mono<ResponseEntity<ApiResponse<VoteResponseDto>>> vote(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody VoteSubmitRequest body) {
        if (body.getSubmissionId() == null || body.getSubmissionId().isBlank()
                || body.getVoteType() == null || body.getVoteType().isBlank()) {
            return Mono.just(ResponseEntity.badRequest()
                    .body(ApiResponse.error(List.of("submissionId and voteType are required"), 400)));
        }
        String token = extractBearerToken(authorization);
        if (token == null) {
            return Mono.just(ResponseEntity.status(401)
                    .body(ApiResponse.error(List.of("Login required: send Authorization: Bearer <token>"), 401)));
        }
        return userIdentityProxy.verifySessionToken(token)
                .flatMap(userId -> voteServiceClient.submitVote(userId, body)
                        .map(ApiResponse::success)
                        .map(ResponseEntity::ok)
                        .onErrorResume(WebClientResponseException.class, ex -> Mono.just(
                                ResponseEntity.status(ex.getStatusCode())
                                        .body(ApiResponse.error(
                                                List.of(ex.getResponseBodyAsString()),
                                                ex.getStatusCode().value(),
                                                "VOTE_ERROR"
                                        )))))
                .switchIfEmpty(Mono.just(ResponseEntity.status(401)
                        .body(ApiResponse.error(List.of("Invalid or expired session"), 401))));
    }

    @GetMapping("/api/v1/votes/{submissionId}")
    public Mono<ResponseEntity<ApiResponse<VoteResponseDto>>> voteCounts(@PathVariable String submissionId) {
        return voteServiceClient.getCounts(submissionId)
                .map(ApiResponse::success)
                .map(ResponseEntity::ok)
                .onErrorResume(WebClientResponseException.class, ex -> Mono.just(
                        ResponseEntity.status(ex.getStatusCode())
                                .body(ApiResponse.error(
                                        List.of(ex.getResponseBodyAsString()),
                                        ex.getStatusCode().value(),
                                        "VOTE_ERROR"
                                ))));
    }

    private static String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return null;
        }
        String raw = authorization.substring(7).trim();
        return raw.isEmpty() ? null : raw;
    }
}
