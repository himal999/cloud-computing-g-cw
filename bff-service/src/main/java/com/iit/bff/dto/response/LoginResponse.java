package com.iit.bff.dto.response;

/**
 * Filled from identity JSON {@code { "token", "userId" }} (see {@code TokenResponse} on identity-service).
 */
public class LoginResponse {

    private String token;
    private String userId;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
