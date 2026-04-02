package com.iit.identity.model;

public class User {
    private String userId;
    private String email;
    private String password;

    public User(String userId, String email, String password) {
        this.userId = userId;
        this.email = email;
        this.password = password;
    }

    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
}
