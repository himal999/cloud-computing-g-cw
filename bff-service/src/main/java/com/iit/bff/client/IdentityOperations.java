package com.iit.bff.client;

import com.iit.bff.dto.request.LoginRequest;
import com.iit.bff.dto.response.LoginResponse;
import com.iit.bff.util.ApiResponse;
import reactor.core.publisher.Mono;

public interface IdentityOperations {
    Mono<ApiResponse<LoginResponse>> login(LoginRequest request);
}