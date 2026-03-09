package com.iit.bff.util;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.core.io.InputStreamResource;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private List<String> errors;
    private int errorCode;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime responseTime;

    public ApiResponse(boolean success, String message, InputStreamResource data) {
        this.success = success;
        this.message = message;
        this.data = (T) data;
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Operation completed successfully");
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .errorCode(0)
                .errors(null)
                .responseTime(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, int errorCode) {
        return error(List.of(message), errorCode, message);
    }

    public static <T> ApiResponse<T> error(List<String> errors, int errorCode, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .errors(errors == null || errors.isEmpty() ? null : errors)
                .errorCode(errorCode)
                .responseTime(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(Throwable ex, int statusCode) {
        return error(ex.getMessage() != null ? ex.getMessage() : "Unexpected error", statusCode);
    }

//    public static ApiResponse<InputStreamResource> fileSuccess(
//            InputStreamResource resource,
//            String message) {
//        return ApiResponse.<InputStreamResource>builder()
//                .success(true)
//                .message(message != null ? message : "File downloaded successfully")
//                .data(resource)
//                .errorCode(0)
//                .errors(null)
//                .responseTime(LocalDateTime.now())
//                .build();
//    }

}