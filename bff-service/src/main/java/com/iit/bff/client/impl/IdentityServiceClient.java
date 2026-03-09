package com.iit.bff.client.impl;

import com.iit.bff.client.IdentityOperations;
import com.iit.bff.dto.request.LoginRequest;
import com.iit.bff.dto.response.LoginResponse;
import com.iit.bff.util.ApiResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.Collections;

@Service
@Log4j2
public class IdentityServiceClient implements IdentityOperations {

    private final WebClient webClient;

    public IdentityServiceClient(@Qualifier("identityWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public Mono<ApiResponse<LoginResponse>> login(LoginRequest request) {
        log.info("Client for login request {}",request);
        return webClient.post()
                .uri("/api/v1/auth/login")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(LoginResponse.class)
                .map(ApiResponse::success)
                .onErrorResume(WebClientResponseException.class, ex ->
                        Mono.just(ApiResponse.error(
                                Collections.singletonList(ex.getResponseBodyAsString()),
                                ex.getStatusCode().value(),
                                "IDENTITY_ERROR"
                        ))
                );
    }

}