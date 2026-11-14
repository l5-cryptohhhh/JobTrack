package dev.jobtrack.dto;

import dev.jobtrack.model.ApplicationStatus;
import dev.jobtrack.model.JobApplication;

import java.time.Instant;
import java.time.LocalDate;

public record JobApplicationResponse(
        Long id,
        String company,
        String role,
        String url,
        ApplicationStatus status,
        String notes,
        LocalDate appliedAt,
        String jobDescription,
        String aiAnalysis,
        Instant createdAt,
        Instant updatedAt
) {

    public static JobApplicationResponse from(JobApplication a) {
        return new JobApplicationResponse(
                a.getId(),
                a.getCompany(),
                a.getRole(),
                a.getUrl(),
                a.getStatus(),
                a.getNotes(),
                a.getAppliedAt(),
                a.getJobDescription(),
                a.getAiAnalysis(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}
