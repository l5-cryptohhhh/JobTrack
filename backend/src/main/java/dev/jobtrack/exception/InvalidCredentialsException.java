package dev.jobtrack.exception;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Credenziali non valide");
    }
}
