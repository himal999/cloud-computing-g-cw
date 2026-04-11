package com.iit.stats.controller;

import com.iit.stats.model.SalarySubmission;
import com.iit.stats.model.StatResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/stats")
public class StatsController {
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/")
    public ResponseEntity<?> stats(@RequestParam(required = false) String country,
                                   @RequestParam(required = false) String role) {
        SalarySubmission[] all = restTemplate.getForObject("http://localhost:8082/salary/all", SalarySubmission[].class);
        if (all == null || all.length == 0) {
            return ResponseEntity.ok(new StatResponse(0,0,0,0));
        }
        double sum = 0;
        int count = 0;
        for (SalarySubmission s : all) {
            if ("APPROVED".equals(s.getStatus()) &&
                    (country == null || country.equalsIgnoreCase(s.getCountry())) &&
                    (role == null || role.equalsIgnoreCase(s.getRole()))) {
                sum += s.getAmount();
                count++;
            }
        }
        double avg = count > 0 ? sum / count : 0;
        return ResponseEntity.ok(new StatResponse(count, avg, sum, 0));
    }
}