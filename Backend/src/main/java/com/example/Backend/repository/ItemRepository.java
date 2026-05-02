package com.example.Backend.repository;

import com.example.Backend.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByStatus(String status);

    List<Item> findByUserId(Long userId);

    List<Item> findByCategory(String category);

    List<Item> findByStatusAndCategory(String status, String category);

    @Query("""
        SELECT i FROM Item i
        WHERE (:search = '' OR
               LOWER(i.title)       LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(i.category)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(i.location)    LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(i.founder)     LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status   = '' OR i.status   = :status)
          AND (:category = '' OR i.category = :category)
          AND (:location = '' OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%')))
        ORDER BY i.createdAt DESC
    """)
    List<Item> searchItems(
        @Param("search")   String search,
        @Param("status")   String status,
        @Param("category") String category,
        @Param("location") String location
    );

    @Query("""
        SELECT i FROM Item i
        WHERE i.status = :status
          AND i.id != :excludeId
          AND (LOWER(i.category) = LOWER(:category)
               OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%')))
        ORDER BY i.createdAt DESC
    """)
    List<Item> findPotentialMatches(
        @Param("status")    String status,
        @Param("excludeId") Long excludeId,
        @Param("category")  String category,
        @Param("location")  String location
    );
}