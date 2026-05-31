package com.backend.sauvibe.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * @author Ömer Asaf Balıkçı
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<Object> handleRuntimeException(RuntimeException ex) {
    if ("Incorrect password".equals(ex.getMessage())) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
        "timestamp", LocalDateTime.now(),
        "status", HttpStatus.BAD_REQUEST.value(),
        "error", "Bad Request",
        "message", ex.getMessage()));
    }

    if ("Event not found".equals(ex.getMessage())) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
        "message", ex.getMessage()));
    }

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
      "message", "An unexpected error occurred"));
  }
}