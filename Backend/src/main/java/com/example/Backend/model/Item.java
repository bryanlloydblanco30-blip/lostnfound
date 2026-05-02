package com.example.Backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Electronics | Accessories | Clothing | Documents | Other
    private String category;

    // Lost | Found | Missing | Claimed
    private String status;

    private String location;

    @Column(name = "date_str")
    private String dateStr;  // stored as display string (e.g. "04-15-2026")

    // Name shown on item card (populated from user.name on create)
    private String founder;

    @Column(columnDefinition = "TEXT")
    private String image;    // URL (local path or remote)

    private Double pinX;   // % from left on campus map (0-100)
    private Double pinY;   // % from top  on campus map (0-100)

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
