package dev.jobtrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ExtractRequest(
        @NotBlank(message = "Incolla il testo dell'annuncio") @Size(max = 20000, message = "Testo troppo lungo") String text
) {
}
