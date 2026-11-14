package dev.jobtrack.dto;

import dev.jobtrack.model.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record JobApplicationRequest(
        @NotBlank String company,
        @NotBlank String role,
        String url,
        ApplicationStatus status,
        String notes,
        LocalDate appliedAt,
        String jobDescription
) {
}
