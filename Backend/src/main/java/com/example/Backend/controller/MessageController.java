package com.example.Backend.controller;

import com.example.Backend.dto.ApiResponse;
import com.example.Backend.dto.ConversationDto;
import com.example.Backend.dto.MessageDto;
import com.example.Backend.dto.MessageRequest;
import com.example.Backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /**
     * GET /api/messages
     * Returns a list of conversations (threads) for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ConversationDto>>> getConversations(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(
                messageService.getConversations(auth.getName())));
    }

    /**
     * GET /api/messages/{conversationId}
     * Returns all messages in a specific conversation, marks them as read.
     */
    @GetMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getMessages(
            @PathVariable String conversationId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(
                messageService.getMessages(conversationId, auth.getName())));
    }

    /**
     * GET /api/messages/with/{receiverId}
     * Convenience endpoint — resolves the canonical conversationId from a receiverId.
     * This is what the frontend uses when opening a chat from the Detailed View.
     */
    @GetMapping("/with/{receiverId}")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getMessagesWith(
            @PathVariable Long receiverId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(
                messageService.getMessagesWith(receiverId, auth.getName())));
    }

    /**
     * POST /api/messages
     * Send a new message to another user.
     * Body: { receiverId: Long, text: String }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(
            @RequestBody MessageRequest request,
            Authentication auth) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(
                    messageService.sendMessage(request, auth.getName())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
