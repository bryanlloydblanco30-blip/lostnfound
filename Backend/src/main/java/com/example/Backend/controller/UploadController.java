package com.example.Backend.controller;

import com.example.Backend.dto.ApiResponse;
import com.example.Backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;

    /**
     * POST /api/upload
     * Accepts multipart/form-data with key "file"
     * Returns { success: true, data: { url: "/uploads/filename.jpg" } }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> upload(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No file provided"));
        }
        try {
            String url = fileStorageService.store(file);
            return ResponseEntity.ok(ApiResponse.ok(Map.of("url", url)));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("File upload failed: " + e.getMessage()));
        }
    }
}
