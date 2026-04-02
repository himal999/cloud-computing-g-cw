package com.iit.identity.model;

public class TokenResponse {
    private String token;
    private String userId;

    public TokenResponse(String token, String userId) {
        this.token = token;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public String getUserId() { return userId; }
}
