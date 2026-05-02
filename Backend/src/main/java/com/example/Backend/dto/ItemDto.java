package com.example.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ItemDto {
    private Long   id;
    private String title;
    private String description;
    private String category;
    private String status;
    private String location;
    private String dateStr;
    private String founder;
    private String image;
    private Double pinX;
    private Double pinY;
    private LocalDateTime createdAt;
    private UserDto postedBy;    // nested user info
    private boolean bookmarked;  // convenience flag for current user
}
