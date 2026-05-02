package com.example.Backend.controller;

import com.example.Backend.dto.ApiResponse;
import com.example.Backend.dto.ItemDto;
import com.example.Backend.dto.UserDto;
import com.example.Backend.model.Report;
import com.example.Backend.model.User;
import com.example.Backend.repository.UserRepository;
import com.example.Backend.service.AuthService;
import com.example.Backend.service.ItemService;
import com.example.Backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ItemService    itemService;
    private final ReportService  reportService;

    /** GET /api/admin/users  — List all users */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userRepository.findAll()
                .stream().map(AuthService::toDto).toList();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    /** DELETE /api/admin/users/{id}  — Delete a user account */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", null));
    }

    /** GET /api/admin/items  — List all items */
    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getAllItems() {
        return ResponseEntity.ok(ApiResponse.ok(itemService.getAllItemsAdmin()));
    }

    /** DELETE /api/admin/items/{id}  — Force-delete any item */
    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable Long id, Authentication auth) {
        itemService.deleteItem(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Item deleted", null));
    }

    /** GET /api/admin/reports  — View all pending reports */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<List<Report>>> getReports() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getAllReports()));
    }

    /** PUT /api/admin/reports/{id}  — Review a report */
    @PutMapping("/reports/{id}")
    public ResponseEntity<ApiResponse<Report>> reviewReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportService.reviewReport(id, body.get("status"))));
    }

    /** GET /api/admin/stats  — Dashboard summary */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        long totalUsers   = userRepository.count();
        List<ItemDto> all = itemService.getAllItemsAdmin();
        long lost    = all.stream().filter(i -> "Lost".equals(i.getStatus())).count();
        long found   = all.stream().filter(i -> "Found".equals(i.getStatus())).count();
        long claimed = all.stream().filter(i -> "Claimed".equals(i.getStatus())).count();
        long pending = reportService.getPendingReports().size();
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "totalUsers",   totalUsers,
                "totalItems",   all.size(),
                "lostItems",    lost,
                "foundItems",   found,
                "claimedItems", claimed,
                "pendingReports", pending
        )));
    }
}
