package dev.jobtrack.service;

import dev.jobtrack.dto.AuthResponse;
import dev.jobtrack.dto.LoginRequest;
import dev.jobtrack.dto.RegisterRequest;
import dev.jobtrack.exception.EmailAlreadyUsedException;
import dev.jobtrack.exception.InvalidCredentialsException;
import dev.jobtrack.model.User;
import dev.jobtrack.repository.UserRepository;
import dev.jobtrack.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());
        if (users.existsByEmail(email)) {
            throw new EmailAlreadyUsedException(email);
        }
        User user = users.save(new User(email, passwordEncoder.encode(request.password())));
        return new AuthResponse(jwtService.generate(user.getId(), user.getEmail()), user.getEmail());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmail(normalize(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(InvalidCredentialsException::new);
        return new AuthResponse(jwtService.generate(user.getId(), user.getEmail()), user.getEmail());
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
