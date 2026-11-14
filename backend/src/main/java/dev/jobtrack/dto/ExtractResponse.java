package dev.jobtrack.dto;

/** Dati estratti dall'annuncio. I campi non trovati sono null. */
public record ExtractResponse(String company, String role, String summary) {
}
