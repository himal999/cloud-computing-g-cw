package com.iit.identity.controller;

import com.iit.identity.model.SignupRequest;
import com.iit.identity.model.TokenResponse;
import com.iit.identity.service.IdentityAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/v1/auth")
public class ApiAuthController {

    private final IdentityAccountService accountService;

    public ApiAuthController(IdentityAccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password required");
        }
        try {
            String userId = accountService.signup(req.getEmail(), req.getPassword()).toString();
            return ResponseEntity.ok(Map.of("userId", userId));
        } catch (IllegalStateException ex) {
            if ("EMAIL_EXISTS".equals(ex.getMessage())) {
                return ResponseEntity.status(409).body("Email already exists");
            }
            throw ex;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        if (body == null) {
            return ResponseEntity.badRequest().body("Request body required");
        }
        String password = body.get("password");
        String principal = firstNonBlank(body.get("email"), body.get("username"));
        if (principal == null || password == null) {
            return ResponseEntity.badRequest().body("email or username, and password required");
        }
        try {
            TokenResponse token = accountService.login(principal.trim(), password);
            return ResponseEntity.ok(token);
        } catch (IllegalArgumentException ex) {
            if ("INVALID_CREDENTIALS".equals(ex.getMessage())) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }
            throw ex;
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(@RequestParam String token) {
        return accountService.verifyToken(token)
                .map(userId -> ResponseEntity.ok(Map.of("userId", userId)))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Invalid token")));
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return null;
    }
}
