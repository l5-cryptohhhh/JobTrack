package dev.jobtrack.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Serve almeno uno tra testo e immagine (data URL base64, come "data:image/jpeg;base64,..."). */
public record ExtractRequest(
        @Size(max = 20000, message = "Testo troppo lungo") String text,
        @Size(max = 5_000_000, message = "Immagine troppo grande") @Pattern(regexp = "^data:image/(png|jpeg|webp);base64,.*", message = "Formato immagine non supportato") String image
) {

    @JsonIgnore
    @AssertTrue(message = "Incolla il testo dell'annuncio o carica uno screenshot")
    public boolean isTextOrImagePresent() {
        return (text != null && !text.isBlank()) || (image != null && !image.isBlank());
    }
}
