package com.iit.bff.controller;

import com.iit.bff.model.LoginRequest;
import com.iit.bff.model.SalarySubmission;
import com.iit.bff.model.SignUpRequest;
import com.iit.bff.model.VoteRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BffController {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${identity.service.url}")
    private String identityServiceUrl;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest request) {
        return restTemplate.postForEntity(identityServiceUrl + "api/v1/auth/signup", request, Map.class);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return restTemplate.postForEntity(identityServiceUrl+"/api/v1/auth/login", request, Map.class);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitSalary(@RequestBody SalarySubmission request) {
        return restTemplate.postForEntity("http://localhost:8082/salary/submit", request, Map.class);
    }

    @PostMapping("/vote")
    public ResponseEntity<?> vote(@RequestHeader HttpHeaders headers, @RequestBody VoteRequest request) {
        String authorization = headers.getFirst(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing Authorization header");
        }
        String token = authorization.substring("Bearer ".length());
        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> verify = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.getForEntity("http://localhost:8080/identity/verify?token=" + token, Map.class);
        if (!verify.getStatusCode().is2xxSuccessful()) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Map<String, Object> body = verify.getBody();
        if (body == null) {
            return ResponseEntity.status(401).body("Invalid token response");
        }
        String userId = (String) body.get("userId");
        request.setUserId(userId);
        return restTemplate.postForEntity("http://localhost:8084/vote/", request, Map.class);
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam(required = false) String country,
                                    @RequestParam(required = false) String company,
                                    @RequestParam(required = false) String role,
                                    @RequestParam(required = false) String level) {
        String url = "http://localhost:8083/search/?" +
                (country != null ? "country=" + country + "&" : "") +
                (company != null ? "company=" + company + "&" : "") +
                (role != null ? "role=" + role + "&" : "") +
                (level != null ? "level=" + level : "");
        return restTemplate.getForEntity(url, Object.class);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats(@RequestParam(required = false) String country,
                                   @RequestParam(required = false) String role) {
        String url = "http://localhost:8085/stats/?" + (country != null ? "country=" + country + "&" : "") + (role != null ? "role=" + role : "");
        return restTemplate.getForEntity(url, Object.class);
    }
}