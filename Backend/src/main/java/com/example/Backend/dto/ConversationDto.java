package com.example.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConversationDto {
    private String        conversationId;
    private UserDto       otherUser;
    private String        lastMessage;
    private LocalDateTime lastMessageAt;
    private long          unreadCount;
}
