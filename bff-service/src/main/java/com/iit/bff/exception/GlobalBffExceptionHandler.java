package com.iit.bff.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalBffExceptionHandler {

    private final ObjectMapper mapper;

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<?> handleClientError(HttpClientErrorException ex) {
        return bodyFromDownstream(ex.getStatusCode(), ex.getResponseBodyAsString());
    }

    @ExceptionHandler(HttpServerErrorException.class)
    public ResponseEntity<?> handleServerError(HttpServerErrorException ex) {
        return bodyFromDownstream(ex.getStatusCode(), ex.getResponseBodyAsString());
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<?> handleConnectionError(ResourceAccessException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service unavailable"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal BFF error"));
    }

    private ResponseEntity<?> bodyFromDownstream(HttpStatusCode status, String body) {
        try {
            if (body == null || body.isBlank()) {
                return ResponseEntity.status(status).body(fallbackBody(status));
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> json = mapper.readValue(body, Map.class);
            return ResponseEntity.status(status).body(json);
        } catch (Exception e) {
            return ResponseEntity.status(status).body(Map.of(
                    "status", status.value(),
                    "error", body,
                    "raw", body));
        }
    }

    private Map<String, Object> fallbackBody(HttpStatusCode status) {
        String message = (status.value() == HttpStatus.UNAUTHORIZED.value())
                ? "Invalid email or password"
                : "Empty response from service";
        return Map.of("status", status.value(), "error", message);
    }
}
