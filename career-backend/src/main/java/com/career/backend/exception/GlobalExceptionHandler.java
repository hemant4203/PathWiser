package com.career.backend.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.career.backend.dto.ErrorResponse;
import com.career.backend.errors.RateLimitExceededException;
import com.career.backend.errors.ResourceNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "Not Found",
                        ex.getMessage()));
    }

    // 400 validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationErrors(
	        MethodArgumentNotValidException ex) {
	
	    StringBuilder message = new StringBuilder();
	
	    ex.getBindingResult().getFieldErrors().forEach(error ->
	            message.append(error.getField())
	                   .append(": ")
	                   .append(error.getDefaultMessage())
	                   .append("; ")
	    );
	
	    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	            .body(new ErrorResponse(
	                    HttpStatus.BAD_REQUEST.value(),
	                    "Validation Failed",
	                    message.toString()
	            ));
	}

    // 400 bad input
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            IllegalArgumentException ex) {

        return ResponseEntity.badRequest()
                .body(new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        "Bad Request",
                        ex.getMessage()));
    }

    // 409 conflict
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleConflict(
            IllegalStateException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                        HttpStatus.CONFLICT.value(),
                        "Conflict",
                        ex.getMessage()));
    }

    // fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(
            Exception ex) {

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Internal Server Error",
                        ex.getMessage()));
    }
    
    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimit(
            RateLimitExceededException ex) {

        return ResponseEntity.status(429)
                .body(new ErrorResponse(
                        429,
                        "Too Many Requests",
                        ex.getMessage()));
    }
}