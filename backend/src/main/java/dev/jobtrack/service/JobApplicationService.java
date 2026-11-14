package dev.jobtrack.service;

import dev.jobtrack.dto.JobApplicationRequest;
import dev.jobtrack.dto.JobApplicationResponse;
import dev.jobtrack.exception.NotFoundException;
import dev.jobtrack.model.ApplicationStatus;
import dev.jobtrack.model.JobApplication;
import dev.jobtrack.repository.JobApplicationRepository;
import dev.jobtrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository applications;
    private final UserRepository users;

    public JobApplicationService(JobApplicationRepository applications, UserRepository users) {
        this.applications = applications;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> list(Long userId, ApplicationStatus status) {
        List<JobApplication> result = (status == null)
                ? applications.findByUserIdOrderByUpdatedAtDesc(userId)
                : applications.findByUserIdAndStatusOrderByUpdatedAtDesc(userId, status);
        return result.stream().map(JobApplicationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse get(Long userId, Long id) {
        return JobApplicationResponse.from(findOwned(userId, id));
    }

    public JobApplicationResponse create(Long userId, JobApplicationRequest request) {
        // getReferenceById evita una SELECT inutile: ci serve solo il riferimento
        JobApplication application = new JobApplication(users.getReferenceById(userId));
        apply(application, request);
        return JobApplicationResponse.from(applications.save(application));
    }

    public JobApplicationResponse update(Long userId, Long id, JobApplicationRequest request) {
        JobApplication application = findOwned(userId, id);
        apply(application, request);
        return JobApplicationResponse.from(application);
    }

    public JobApplicationResponse updateStatus(Long userId, Long id, ApplicationStatus status) {
        JobApplication application = findOwned(userId, id);
        application.setStatus(status);
        return JobApplicationResponse.from(application);
    }

    public void delete(Long userId, Long id) {
        applications.delete(findOwned(userId, id));
    }

    // Se la candidatura esiste ma è di un altro utente rispondiamo 404, non 403:
    // così non riveliamo l'esistenza di risorse altrui.
    private JobApplication findOwned(Long userId, Long id) {
        return applications.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Candidatura non trovata: " + id));
    }

    private void apply(JobApplication application, JobApplicationRequest request) {
        application.setCompany(request.company().trim());
        application.setRole(request.role().trim());
        application.setUrl(request.url());
        application.setStatus(request.status() != null ? request.status() : ApplicationStatus.WISHLIST);
        application.setNotes(request.notes());
        application.setAppliedAt(request.appliedAt());
        application.setJobDescription(request.jobDescription());
    }
}
