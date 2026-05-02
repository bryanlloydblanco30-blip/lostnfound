package com.example.Backend.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Long   id;
    private String email;
    private String srCode;
    private String name;
    private String number;
    private String course;
    private String section;
    private String photo;
    private String role;
}
