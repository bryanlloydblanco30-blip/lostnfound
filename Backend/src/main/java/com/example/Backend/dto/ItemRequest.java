package com.example.Backend.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ItemRequest {
    private String title;
    private String description;
    private String category;
    private String status;
    private String location;
    private String dateStr;
    private String image;
    private Double pinX;
    private Double pinY;
}
