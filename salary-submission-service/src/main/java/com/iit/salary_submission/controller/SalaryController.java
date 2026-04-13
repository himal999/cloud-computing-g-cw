package com.iit.salary_submission.controller;

import com.iit.salary_submission.model.SalarySubmission;
import com.iit.salary_submission.repository.SalarySubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/salary")
public class SalaryController {
    private final SalarySubmissionRepository repository;

    public SalaryController(SalarySubmissionRepository repository) {
        this.repository = repository;
    }

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
        repository.save(request);
        return ResponseEntity.ok(Map.of("submissionId", id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmission(@PathVariable String id) {
        return repository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public List<SalarySubmission> allSubmissions() {
        return repository.findAll();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id) {
        return repository.findById(id)
                .<ResponseEntity<?>>map(submission -> {
                    submission.setStatus("APPROVED");
                    repository.save(submission);
                    return ResponseEntity.ok(submission);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}