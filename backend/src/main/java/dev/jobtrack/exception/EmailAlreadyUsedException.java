package dev.jobtrack.exception;

public class EmailAlreadyUsedException extends RuntimeException {

    public EmailAlreadyUsedException(String email) {
        super("Email già registrata: " + email);
    }
}
