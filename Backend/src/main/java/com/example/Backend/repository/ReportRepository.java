package com.example.Backend.repository;

import com.example.Backend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatus(String status);
    List<Report> findByReporterId(Long reporterId);
    boolean existsByReporterIdAndItemId(Long reporterId, Long itemId);
}
