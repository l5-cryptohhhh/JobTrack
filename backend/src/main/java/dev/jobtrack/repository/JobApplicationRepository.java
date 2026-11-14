package dev.jobtrack.repository;

import dev.jobtrack.model.ApplicationStatus;
import dev.jobtrack.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserIdOrderByUpdatedAtDesc(Long userId);

    List<JobApplication> findByUserIdAndStatusOrderByUpdatedAtDesc(Long userId, ApplicationStatus status);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);
}
