package com.example.Backend.controller;

import com.example.Backend.dto.ApiResponse;
import com.example.Backend.dto.ReportRequest;
import com.example.Backend.model.Report;
import com.example.Backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /** POST /api/reports  — Report a suspicious item */
    @PostMapping
    public ResponseEntity<ApiResponse<Report>> submitReport(
            @RequestBody ReportRequest request,
            Authentication auth) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(
                    reportService.submitReport(request, auth.getName())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
