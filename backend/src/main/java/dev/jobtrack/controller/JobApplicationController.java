package dev.jobtrack.controller;

import dev.jobtrack.dto.JobApplicationRequest;
import dev.jobtrack.dto.JobApplicationResponse;
import dev.jobtrack.dto.StatusUpdateRequest;
import dev.jobtrack.model.ApplicationStatus;
import dev.jobtrack.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<JobApplicationResponse> list(@AuthenticationPrincipal Long userId,
                                             @RequestParam(required = false) ApplicationStatus status) {
        return service.list(userId, status);
    }

    @GetMapping("/{id}")
    public JobApplicationResponse get(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        return service.get(userId, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplicationResponse create(@AuthenticationPrincipal Long userId,
                                         @Valid @RequestBody JobApplicationRequest request) {
        return service.create(userId, request);
    }

    @PutMapping("/{id}")
    public JobApplicationResponse update(@AuthenticationPrincipal Long userId,
                                         @PathVariable Long id,
                                         @Valid @RequestBody JobApplicationRequest request) {
        return service.update(userId, id, request);
    }

    @PatchMapping("/{id}/status")
    public JobApplicationResponse updateStatus(@AuthenticationPrincipal Long userId,
                                               @PathVariable Long id,
                                               @Valid @RequestBody StatusUpdateRequest request) {
        return service.updateStatus(userId, id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Long userId, @PathVariable Long id) {
        service.delete(userId, id);
    }
}
