package com.iit.identity.service;

import com.iit.identity.entity.SessionToken;
import com.iit.identity.entity.UserAccount;
import com.iit.identity.repository.SessionTokenRepository;
import com.iit.identity.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class IdentityAccountService {

    private final UserAccountRepository users;
    private final SessionTokenRepository sessions;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Map<String, Object> signup(String email, String password) {

        if (email == null || password == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password required");
        }

        String normalized = email.trim().toLowerCase();

        if (users.existsByEmailIgnoreCase(normalized)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        UserAccount user = new UserAccount(
                UUID.randomUUID(),
                normalized,
                passwordEncoder.encode(password)
        );

        users.save(user);

        return Map.of(
                "message", "User created successfully",
                "userId", user.getId().toString()
        );
    }

    @Transactional
    public Map<String, Object> login(String email, String rawPassword) {

        log.info("LOGIN REQUEST: {}", email);

        if (email == null || rawPassword == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password required");
        }

        String normalized = email.trim().toLowerCase();

        Optional<UserAccount> found = users.findByEmailIgnoreCase(normalized);

        if (found.isEmpty()) {
            log.warn("USER NOT FOUND: {}", normalized);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        UserAccount user = found.get();

        boolean match = passwordEncoder.matches(rawPassword, user.getPasswordHash());

        log.info("PASSWORD MATCH: {}", match);

        if (!match) {
            log.warn("WRONG PASSWORD: {}", normalized);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = UUID.randomUUID().toString();
        sessions.save(new SessionToken(token, user));

        return Map.of(
                "token", token,
                "userId", user.getId().toString()
        );
    }

    @Transactional(readOnly = true)
    public String verify(String token) {

        return sessions.findById(token)
                .map(s -> s.getUser().getId().toString())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token")
                );
    }

}