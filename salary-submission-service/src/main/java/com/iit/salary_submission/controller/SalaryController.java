package com.iit.salary_submission.controller;

import com.iit.salary_submission.model.SalarySubmission;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/salary")
public class SalaryController {
    private final Map<String, SalarySubmission> submissions = new ConcurrentHashMap<>();

    @PostMapping("/submit")
    public ResponseEntity<?> submitSalary(@RequestBody SalarySubmission request) {
        if (request.getCompany() == null || request.getRole() == null || request.getCountry() == null) {
            return ResponseEntity.badRequest().body("company, role, country are required");
        }
        String id = UUID.randomUUID().toString();
        request.setId(id);
        request.setStatus("APPROVED");
        request.setAnonymized(true);
        request.setUpvotes(0);
        request.setDownvotes(0);
        submissions.put(id, request);
        return ResponseEntity.ok(Map.of("submissionId", id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmission(@PathVariable String id) {
        SalarySubmission submission = submissions.get(id);
        if (submission == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/all")
    public List<SalarySubmission> allSubmissions() {
        return new ArrayList<>(submissions.values());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id) {
        SalarySubmission submission = submissions.get(id);
        if (submission == null) {
            return ResponseEntity.notFound().build();
        }
        submission.setStatus("APPROVED");
        return ResponseEntity.ok(submission);
    }
}