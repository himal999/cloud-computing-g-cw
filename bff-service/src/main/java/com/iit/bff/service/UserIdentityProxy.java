package com.iit.bff.service;

import com.iit.bff.dto.request.SignupRequest;
import com.iit.bff.dto.response.SignupResponse;
import com.iit.bff.util.ApiResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Signup and session verification against identity-service ({@code /api/v1/auth/...}).
 * Login stays on {@link com.iit.bff.client.impl.IdentityServiceClient} (same {@code /api/v1/auth/login}).
 */
@Service
public class UserIdentityProxy {

    private final WebClient identityWebClient;

    public UserIdentityProxy(@Qualifier("identityWebClient") WebClient identityWebClient) {
        this.identityWebClient = identityWebClient;
    }

    public Mono<ApiResponse<SignupResponse>> signup(SignupRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return Mono.just(ApiResponse.error(List.of("email and password required"), 400));
        }
        Map<String, String> body = new HashMap<>();
        body.put("email", request.getEmail().trim());
        body.put("password", request.getPassword());
        return identityWebClient.post()
                .uri("/api/v1/auth/signup")
                .bodyValue(body)
                .exchangeToMono(response -> {
                    if (response.statusCode().value() == 409) {
                        return response.bodyToMono(String.class)
                                .defaultIfEmpty("Email already exists")
                                .map(msg -> ApiResponse.<SignupResponse>error(List.of(msg), 409, "Conflict"));
                    }
                    if (response.statusCode().is2xxSuccessful()) {
                        return response.bodyToMono(new ParameterizedTypeReference<Map<String, String>>() { })
                                .map(m -> ApiResponse.success(new SignupResponse(m.get("userId"))));
                    }
                    return response.bodyToMono(String.class)
                            .defaultIfEmpty("Signup failed")
                            .map(msg -> ApiResponse.<SignupResponse>error(
                                    List.of(msg), response.statusCode().value(), "IDENTITY_ERROR"));
                });
    }

    public Mono<String> verifySessionToken(String token) {
        if (token == null || token.isBlank()) {
            return Mono.empty();
        }
        return identityWebClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/v1/auth/verify").queryParam("token", token.trim()).build())
                .exchangeToMono(response -> {
                    if (response.statusCode().value() == 401) {
                        return Mono.empty();
                    }
                    if (response.statusCode().is2xxSuccessful()) {
                        return response.bodyToMono(new ParameterizedTypeReference<Map<String, String>>() { })
                                .map(m -> m.get("userId"))
                                .filter(Objects::nonNull);
                    }
                    return Mono.empty();
                });
    }
}
