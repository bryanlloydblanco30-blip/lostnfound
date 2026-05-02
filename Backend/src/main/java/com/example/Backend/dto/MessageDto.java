package com.example.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageDto {
    private Long          id;
    private String        conversationId;
    private UserDto       sender;
    private UserDto       receiver;
    private String        text;
    private boolean       read;
    private LocalDateTime createdAt;
}
