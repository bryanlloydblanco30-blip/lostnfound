package com.example.Backend.controller;

import com.example.Backend.dto.ApiResponse;
import com.example.Backend.dto.ItemDto;
import com.example.Backend.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    /** GET /api/bookmarks  — Get all bookmarks for current user */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemDto>>> getBookmarks(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(
                bookmarkService.getBookmarks(auth.getName())));
    }

    /** POST /api/bookmarks  — Add a bookmark. Body: { itemId: Long } */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addBookmark(
            @RequestBody Map<String, Long> body,
            Authentication auth) {
        try {
            bookmarkService.addBookmark(body.get("itemId"), auth.getName());
            return ResponseEntity.ok(ApiResponse.ok("Bookmarked", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** DELETE /api/bookmarks/{itemId}  — Remove a bookmark */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @PathVariable Long itemId, Authentication auth) {
        bookmarkService.removeBookmark(itemId, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Bookmark removed", null));
    }
}
