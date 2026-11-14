package dev.jobtrack.exception;

public class AiUnavailableException extends RuntimeException {
    private final boolean notConfigured;

    public AiUnavailableException(String message, boolean notConfigured) {
        super(message);
        this.notConfigured = notConfigured;
    }

    public boolean isNotConfigured() {
        return notConfigured;
    }
}
