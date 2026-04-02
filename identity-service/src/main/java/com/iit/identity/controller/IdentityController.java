package com.iit.identity.controller;


import com.iit.identity.model.LoginRequest;
import com.iit.identity.model.SignupRequest;
import com.iit.identity.model.TokenResponse;
import com.iit.identity.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/identity")
public class IdentityController {
    private final Map<String, User> usersByEmail = new ConcurrentHashMap<>();
    private final Map<String, String> tokens = new ConcurrentHashMap<>();

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password required");
        }
        if (usersByEmail.containsKey(req.getEmail())) {
            return ResponseEntity.status(409).body("Email already exists");
        }
        String userId = UUID.randomUUID().toString();
        User user = new User(userId, req.getEmail(), req.getPassword());
        usersByEmail.put(req.getEmail(), user);
        return ResponseEntity.ok(Map.of("userId", userId));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        User user = usersByEmail.get(req.getEmail());
        if (user == null || !user.getPassword().equals(req.getPassword())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
        String token = UUID.randomUUID().toString();
        tokens.put(token, user.getUserId());
        return ResponseEntity.ok(new TokenResponse(token, user.getUserId()));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) {
        if (token == null || !tokens.containsKey(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        return ResponseEntity.ok(Map.of("userId", tokens.get(token)));
    }
}
