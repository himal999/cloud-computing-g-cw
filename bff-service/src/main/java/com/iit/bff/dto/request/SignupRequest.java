package com.iit.bff.dto.request;

import lombok.Data;

@Data
public class SignupRequest {
    private String email;
    private String password;
}
