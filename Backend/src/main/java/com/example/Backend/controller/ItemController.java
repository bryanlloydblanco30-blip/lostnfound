package com.example.Backend.controller;

import com.example.Backend.dto.ApiResponse;
import com.example.Backend.dto.ItemDto;
import com.example.Backend.dto.ItemRequest;
import com.example.Backend.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    /**
     * GET /api/items
     * Optional query params: search, status, category, location
     * Returns all items matching the filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemDto>>> getAllItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(ApiResponse.ok(
                itemService.searchItems(search, status, category, location, email)));
    }

    /**
     * GET /api/items/mine
     * Returns only items posted by the authenticated user (My Reports page).
     */
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getMyItems(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(
                itemService.getMyItems(auth.getName())));
    }

    /**
     * GET /api/items/{id}
     * Returns a single item with full detail and poster info.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemDto>> getItem(
            @PathVariable Long id, Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        try {
            return ResponseEntity.ok(ApiResponse.ok(itemService.getItemById(id, email)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/items/{id}/matches
     * Returns items that potentially match this item (opposite status, same category/location).
     */
    @GetMapping("/{id}/matches")
    public ResponseEntity<ApiResponse<List<ItemDto>>> getMatches(
            @PathVariable Long id, Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(ApiResponse.ok(itemService.findMatches(id, email)));
    }

    /**
     * POST /api/items
     * Create a new lost/found item. Requires JWT.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ItemDto>> createItem(
            @RequestBody ItemRequest request,
            Authentication auth) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(
                    "Item created successfully",
                    itemService.createItem(request, auth.getName())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PUT /api/items/{id}
     * Update an existing item. Only owner or admin can update.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemDto>> updateItem(
            @PathVariable Long id,
            @RequestBody ItemRequest request,
            Authentication auth) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(
                    itemService.updateItem(id, request, auth.getName())));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DELETE /api/items/{id}
     * Delete an item. Only owner or admin can delete.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable Long id, Authentication auth) {
        try {
            itemService.deleteItem(id, auth.getName());
            return ResponseEntity.ok(ApiResponse.ok("Item deleted", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }
}
