package com.iit.search.controller;

import com.iit.search.model.SalarySubmission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
public class SearchController {
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String level
    ) {
        SalarySubmission[] all = restTemplate.getForObject("http://localhost:8082/salary/all", SalarySubmission[].class);
        if (all == null) {
            return ResponseEntity.status(503).body("Salary service unavailable");
        }

        List<SalarySubmission> filtered = Arrays.stream(all)
                .filter(s -> "APPROVED".equals(s.getStatus()))
                .filter(s -> country == null || country.equalsIgnoreCase(s.getCountry()))
                .filter(s -> company == null || company.equalsIgnoreCase(s.getCompany()))
                .filter(s -> role == null || role.equalsIgnoreCase(s.getRole()))
                .filter(s -> level == null || level.equalsIgnoreCase(s.getLevel()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }
}
