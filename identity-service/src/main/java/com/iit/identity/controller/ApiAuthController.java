package com.iit.identity.controller;

import com.iit.identity.model.SignupRequest;
import com.iit.identity.service.IdentityAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class ApiAuthController {

    private final IdentityAccountService service;

    @PostMapping(value = "/signup", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> signup(@RequestBody SignupRequest request) {

        return ResponseEntity.ok(
                service.signup(request.getFirstName(), request.getLastName(), request.getEmail(), request.getPassword())
        );
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {

        return ResponseEntity.ok(
                service.login(body.get("email"), body.get("password"))
        );
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) {

        return ResponseEntity.ok(
                Map.of(
                        "valid", true,
                        "userId", service.verify(token)
                )
        );
    }
}