package com.example.Backend.service;

import com.example.Backend.dto.ReportRequest;
import com.example.Backend.model.Item;
import com.example.Backend.model.Report;
import com.example.Backend.model.User;
import com.example.Backend.repository.ItemRepository;
import com.example.Backend.repository.ReportRepository;
import com.example.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ItemRepository   itemRepository;
    private final UserRepository   userRepository;

    public Report submitReport(ReportRequest req, String reporterEmail) {
        User reporter = userRepository.findByEmail(reporterEmail).orElseThrow();
        Item item     = itemRepository.findById(req.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));
        if (reportRepository.existsByReporterIdAndItemId(reporter.getId(), item.getId())) {
            throw new RuntimeException("You have already reported this item");
        }
        return reportRepository.save(Report.builder()
                .reporter(reporter)
                .item(item)
                .reason(req.getReason())
                .build());
    }

    // Admin methods
    public List<Report> getPendingReports() {
        return reportRepository.findByStatus("pending");
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Report reviewReport(Long id, String status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(status); // "reviewed" or "dismissed"
        return reportRepository.save(report);
    }
}
